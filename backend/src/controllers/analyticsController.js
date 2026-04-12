import { pool } from "../db.js";

// GET /api/analytics/overview
export const getOverview = async (req, res) => {
  try {
    const totalAlumniQuery = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'ALUMNI'`);
    const activeAlumniQuery = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'ALUMNI' AND is_active = true`);
    
    // Count unique companies from alumni_profiles
    const companiesQuery = await pool.query(`
      SELECT COUNT(DISTINCT company) 
      FROM alumni_profiles 
      WHERE company IS NOT NULL AND company != ''
    `);
    
    // Count mentors
    const mentorsQuery = await pool.query(`
      SELECT COUNT(*) 
      FROM alumni_profiles 
      WHERE available_for_mentorship = true
    `);

    res.json({
      total_alumni: parseInt(totalAlumniQuery.rows[0].count),
      active_alumni: parseInt(activeAlumniQuery.rows[0].count),
      companies: parseInt(companiesQuery.rows[0].count),
      mentors: parseInt(mentorsQuery.rows[0].count),
    });
  } catch (err) {
    console.error("Error fetching overview analytics:", err);
    res.status(500).json({ error: "Failed to fetch overview metrics" });
  }
};

// GET /api/analytics/graduation-years
export const getGraduationYears = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT passing_year AS year, COUNT(*) as count 
      FROM alumni_profiles 
      WHERE passing_year IS NOT NULL
      GROUP BY passing_year 
      ORDER BY passing_year ASC
    `);
    res.json(rows.map(row => ({ year: row.year.toString(), count: parseInt(row.count) })));
  } catch (err) {
    console.error("Error fetching graduation years:", err);
    res.status(500).json({ error: "Failed to fetch graduation year data" });
  }
};

// GET /api/analytics/industries
export const getIndustries = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT department AS name, COUNT(*) as value 
      FROM alumni_profiles 
      WHERE department IS NOT NULL AND department != ''
      GROUP BY department
      ORDER BY value DESC
    `);
    res.json(rows.map(row => ({ name: row.name, value: parseInt(row.value) })));
  } catch (err) {
    console.error("Error fetching industries:", err);
    res.status(500).json({ error: "Failed to fetch industry data" });
  }
};

// GET /api/analytics/companies
export const getCompanies = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT company AS name, COUNT(*) as count 
      FROM alumni_profiles 
      WHERE company IS NOT NULL AND company != ''
      GROUP BY company
      ORDER BY count DESC
      LIMIT 10
    `);
    res.json(rows.map(row => ({ name: row.name, count: parseInt(row.count) })));
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ error: "Failed to fetch top companies" });
  }
};

// GET /api/analytics/locations
export const getLocations = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT location AS name, COUNT(*) as count 
      FROM users 
      WHERE role = 'ALUMNI' AND location IS NOT NULL AND location != ''
      GROUP BY location
      ORDER BY count DESC
      LIMIT 10
    `);
    res.json(rows.map(row => ({ name: row.name, count: parseInt(row.count) })));
  } catch (err) {
    console.error("Error fetching locations:", err);
    res.status(500).json({ error: "Failed to fetch location data" });
  }
};
