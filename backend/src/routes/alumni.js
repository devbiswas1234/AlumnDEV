import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * CREATE or UPDATE my profile (ALUMNI only)
 */
router.post("/me", requireAuth("ALUMNI"), async (req, res) => {
  const userId = req.user.id;
  const {
    roll_number,
    department,
    passing_year,
    company,
    designation,
    bio,
    linkedin_url,
    visibility,
    photo_url
  } = req.body;

  try {
    const existing = await pool.query(
      "SELECT 1 FROM alumni_profiles WHERE user_id = $1",
      [userId]
    );

    if (existing.rows.length) {
      const { rows } = await pool.query(
        `
        UPDATE alumni_profiles SET
          roll_number=$1,
          department=$2,
          passing_year=$3,
          company=$4,
          designation=$5,
          bio=$6,
          linkedin_url=$7,
          visibility=$8,
          photo_url=$9
        WHERE user_id=$10
        RETURNING *
        `,
        [
          roll_number,
          department,
          passing_year,
          company,
          designation,
          bio,
          linkedin_url,
          visibility,
          photo_url,
          userId
        ]
      );

      return res.json({ profile: rows[0] });
    }

    const { rows } = await pool.query(
      `
      INSERT INTO alumni_profiles
      (user_id, roll_number, department, passing_year, company, designation, bio, linkedin_url, visibility, photo_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        userId,
        roll_number,
        department,
        passing_year,
        company,
        designation,
        bio,
        linkedin_url,
        visibility,
        photo_url
      ]
    );

    res.json({ profile: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * SEARCH / DIRECTORY (search + filter + sort + pagination + mentorship topics)
 */
router.get("/search", requireAuth(), async (req, res) => {
  try {
    const {
      q,
      department,
      passing_year,
      company,
      available,
      topics,
      sort,
      page = 1,
      limit = 6
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let conditions = ["ap.visibility = 'PUBLIC'"];
    let values = [];
    let idx = 1;

    if (q && q.trim()) {
      conditions.push(`u.name ILIKE $${idx}`);
      values.push(`%${q.trim()}%`);
      idx++;
    }

    if (department && department.trim()) {
      conditions.push(`ap.department = $${idx}`);
      values.push(department.trim());
      idx++;
    }

    if (passing_year) {
      conditions.push(`ap.passing_year = $${idx}`);
      values.push(passing_year);
      idx++;
    }

    if (company && company.trim()) {
      conditions.push(`ap.company ILIKE $${idx}`);
      values.push(`%${company.trim()}%`);
      idx++;
    }

    if (available === "true") {
      conditions.push(`ap.available_for_mentorship = $${idx}`);
      values.push(true);
      idx++;
    }

    // 🔔 Filter by mentorship topics
    if (topics) {
      const topicsArray = topics.split(",").map((t) => t.trim());
      conditions.push(
        `(${topicsArray.map((_, i) => `$${idx + i} = ANY(ap.mentorship_topics)`).join(" OR ")})`
      );
      values.push(...topicsArray);
      idx += topicsArray.length;
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    /* ---------- SAFE SORTING ---------- */
    let orderBy = "u.name ASC";

    switch (sort) {
      case "name_desc":
        orderBy = "u.name DESC";
        break;
      case "year_desc":
        orderBy = "ap.passing_year DESC";
        break;
      case "year_asc":
        orderBy = "ap.passing_year ASC";
        break;
      default:
        orderBy = "u.name ASC";
    }

    /* ---------- TOTAL COUNT ---------- */
    const countResult = await pool.query(
      `
      SELECT COUNT(*)
      FROM alumni_profiles ap
      JOIN users u ON ap.user_id = u.id
      ${whereClause}
      `,
      values
    );

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limitNum);

    /* ---------- PAGINATED DATA ---------- */
    const dataResult = await pool.query(
      `
      SELECT
        u.id AS user_id,
        u.name,
        u.location,
        ap.department,
        ap.passing_year,
        ap.company,
        ap.designation,
        ap.verified,
        ap.available_for_mentorship,
        ap.mentorship_topics
      FROM alumni_profiles ap
      JOIN users u ON ap.user_id = u.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${idx} OFFSET $${idx + 1}
      `,
      [...values, limitNum, offset]
    );

    res.json({
      alumni: dataResult.rows,
      pagination: {
        total,
        page: pageNum,
        totalPages
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch alumni" });
  }
});

/**
 * GET profile analytics (ALUMNI only)
 */
router.get("/analytics", requireAuth("ALUMNI"), async (req, res) => {
  const userId = req.user.id;

  const views = await pool.query(
    `SELECT COUNT(*) FROM profile_views WHERE alumni_id=$1`,
    [userId]
  );

  res.json({
    analytics: {
      totalViews: Number(views.rows[0].count),
      pendingRequests: 0,
      acceptedRequests: 0,
      rejectedRequests: 0
    }
  });
});

// MUST be ABOVE "/:id"
router.get("/me", requireAuth("ALUMNI"), async (req, res) => {
  const result = await pool.query(
    `
    SELECT id, name, email, batch, degree, location
    FROM users
    WHERE id = $1 AND role = 'ALUMNI'
    `,
    [req.user.id]
  );

  if (!result.rows.length)
    return res.status(404).json({ error: "Alumni not found" });

  res.json({ profile: result.rows[0] });
});

/**
 * GET alumni profile by ID
 */
router.get("/:id", requireAuth(), async (req, res) => {
  const { rows } = await pool.query(
    `
    SELECT 
      u.id AS user_id,
      u.name,
      u.email,
      u.location,
      ap.roll_number,
      ap.department,
      ap.passing_year,
      ap.company,
      ap.designation,
      ap.bio,
      ap.linkedin_url,
      ap.visibility,
      ap.verified,
      ap.photo_url,
      ap.available_for_mentorship
    FROM alumni_profiles ap
    JOIN users u ON ap.user_id = u.id
    WHERE ap.user_id = $1
    `,
    [req.params.id]
  );

  if (!rows.length) {
    return res.status(404).json({ error: "Alumni not found" });
  }

  const profile = rows[0];

  if (profile.visibility === "PRIVATE" && req.user.id !== profile.user_id) {
    return res.status(403).json({ error: "Profile is private" });
  }

  res.json({ profile });
}); 

/**
 * GET suggested mentors for a student based on topics
 */
router.get("/suggestions", requireAuth("STUDENT"), async (req, res) => {
  const { topics } = req.query; // comma-separated topics
  if (!topics) return res.status(400).json({ message: "Topics required" });

  const topicsArray = topics.split(",").map((t) => t.trim());

  try {
    const { rows } = await pool.query(
      `
      SELECT
        u.id AS user_id,
        u.name,
        u.location,
        ap.department,
        ap.company,
        ap.designation,
        ap.available_for_mentorship,
        ap.mentorship_topics
      FROM alumni_profiles ap
      JOIN users u ON ap.user_id = u.id
      WHERE ap.available_for_mentorship = TRUE
        AND (${topicsArray
          .map((_, i) => `$${i + 1} = ANY(ap.mentorship_topics)`)
          .join(" OR ")})
      ORDER BY u.name
      LIMIT 10
      `,
      topicsArray
    );

    res.json({ suggestions: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch suggestions" });
  }
});
 
router.put("/me", requireAuth("ALUMNI"), async (req, res) => {
  const {
    name,
    batch,
    degree,
    location,
    photo_url,
    bio,
    department,
    passing_year,
    company,
    designation,
    linkedin_url,
    available_for_mentorship,
  } = req.body;

  try {
    /* 🔹 UPDATE USERS TABLE */
    await pool.query(
      `
      UPDATE users
      SET name=$1, batch=$2, degree=$3, location=$4
      WHERE id=$5 AND role='ALUMNI'
      `,
      [name, batch, degree, location, req.user.id]
    );
    await pool.query(
      `
      UPDATE alumni_profiles
      SET name=$1, batch=$2, degree=$3, location=$4
      WHERE id=$5 AND role='ALUMNI'
      `,
      [name, batch, degree, location, req.user.id]
    );

    /* 🔹 UPSERT ALUMNI PROFILE */
    const result = await pool.query(
      `
      INSERT INTO alumni_profile
      (
        user_id,
        photo_url,
        bio,
        department,
        passing_year,
        company,
        designation,
        linkedin_url,
        available_for_mentorship
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (user_id)
      DO UPDATE SET
        photo_url=EXCLUDED.photo_url,
        bio=EXCLUDED.bio,
        department=EXCLUDED.department,
        passing_year=EXCLUDED.passing_year,
        company=EXCLUDED.company,
        designation=EXCLUDED.designation,
        linkedin_url=EXCLUDED.linkedin_url,
        available_for_mentorship=EXCLUDED.available_for_mentorship
      RETURNING *
      `,
      [
        req.user.id,
        photo_url,
        bio,
        department,
        passing_year,
        company,
        designation,
        linkedin_url,
        available_for_mentorship,
      ]
    );

    res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update alumni profile" });
  }
});

export default router;
