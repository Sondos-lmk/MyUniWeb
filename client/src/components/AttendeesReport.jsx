import React, { useState } from 'react';
import axios from 'axios';

export default function AttendeesReport() {
  const [filters, setFilters] = useState({ name: '', type: '', startDate: '', endDate: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const params = {};
      if (filters.name) params.name = filters.name;
      if (filters.type) params.type = filters.type;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await axios.get(`${apiUrl}/api/admin/reports/attendees`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setData(res.data.report || []);
    } catch (err) {
      console.error('Error fetching attendees report:', err);
      alert(err.response?.data?.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 mb-8">
      <h2 className="text-xl font-semibold mb-2">Attendees Report</h2>
      <div className="flex flex-wrap gap-2 mb-2">
        <input
          type="text"
          placeholder="Event name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className="border p-2"
        />
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="border p-2"
        >
          <option value="">All types</option>
          <option value="workshop">Workshop</option>
          <option value="trip">Trip</option>
          <option value="gym">Gym</option>
        </select>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          className="border p-2"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="border p-2"
        />
        <button
          onClick={fetchReport}
          className="bg-indigo-600 text-white px-3 py-2 rounded"
        >
          {loading ? 'Loading...' : 'Generate'}
        </button>
      </div>

      {data && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Title</th>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Start</th>
                <th className="p-2 border">End</th>
                <th className="p-2 border">Attendees</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} className="text-center">
                  <td className="p-2 border">{r.title}</td>
                  <td className="p-2 border">{r.type}</td>
                  <td className="p-2 border">{r.startDate ? new Date(r.startDate).toLocaleDateString() : '-'}</td>
                  <td className="p-2 border">{r.endDate ? new Date(r.endDate).toLocaleDateString() : '-'}</td>
                  <td className="p-2 border">{r.attendees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
