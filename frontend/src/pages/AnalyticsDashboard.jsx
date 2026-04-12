import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const AnalyticsDashboard = () => {
  const [overview, setOverview] = useState({
    total_alumni: 0,
    active_alumni: 0,
    companies: 0,
    mentors: 0
  });
  const [graduationYears, setGraduationYears] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const [
          overviewRes,
          yearsRes,
          industriesRes,
          companiesRes,
          locationsRes
        ] = await Promise.all([
          axios.get("http://localhost:5000/api/analytics/overview", config),
          axios.get("http://localhost:5000/api/analytics/graduation-years", config),
          axios.get("http://localhost:5000/api/analytics/industries", config),
          axios.get("http://localhost:5000/api/analytics/companies", config),
          axios.get("http://localhost:5000/api/analytics/locations", config)
        ]);

        setOverview(overviewRes.data);
        setGraduationYears(yearsRes.data);
        setIndustries(industriesRes.data);
        setCompanies(companiesRes.data);
        setLocations(locationsRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load analytics", err);
        setError("Failed to load analytics data. Ensure you have the correct permissions.");
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading analytics...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Institutional Insights
          </h1>
          <p className="text-gray-400 mt-2">Data analytics and platform metrics</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#111111] border border-[#222] p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#333] transition-all">
            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Alumni</h3>
            <p className="text-4xl font-bold mt-2 text-blue-400">{overview.total_alumni}</p>
          </div>
          <div className="bg-[#111111] border border-[#222] p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#333] transition-all">
            <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors pointer-events-none" />
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Active Alumni</h3>
            <p className="text-4xl font-bold mt-2 text-green-400">{overview.active_alumni}</p>
          </div>
          <div className="bg-[#111111] border border-[#222] p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#333] transition-all">
            <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors pointer-events-none" />
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Companies</h3>
            <p className="text-4xl font-bold mt-2 text-purple-400">{overview.companies}</p>
          </div>
          <div className="bg-[#111111] border border-[#222] p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#333] transition-all">
            <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Mentors</h3>
            <p className="text-4xl font-bold mt-2 text-amber-400">{overview.mentors}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Graduation Years Bar Chart */}
          <div className="bg-[#111111] border border-[#222] rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-6 text-gray-200">Alumni by Graduation Year</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graduationYears}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="year" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Industry Distribution Pie Chart */}
          <div className="bg-[#111111] border border-[#222] rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-6 text-gray-200">Industry Distribution</h3>
            <div className="h-80 w-full flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={industries}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {industries.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Companies Bar Chart */}
          <div className="bg-[#111111] border border-[#222] rounded-2xl p-6 shadow-xl lg:col-span-2">
            <h3 className="text-xl font-semibold mb-6 text-gray-200">Top Companies Hiring Alumni</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companies} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                  <XAxis type="number" stroke="#888" />
                  <YAxis dataKey="name" type="category" stroke="#888" width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    cursor={{fill: '#222'}}
                  />
                  <Bar dataKey="count" fill="#00C49F" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="bg-[#111111] border border-[#222] rounded-2xl p-6 shadow-xl lg:col-span-2">
            <h3 className="text-xl font-semibold mb-6 text-gray-200">Geographic Distribution</h3>
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" fill="#FFBB28" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
