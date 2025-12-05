import React, { useState } from 'react';
import axios from 'axios';
import ModernAlert from './ui/ModernAlert';

export default function RevenueReport() {
  const [filters, setFilters] = useState({ type: '', startDate: '', endDate: '', sort: '' });
  const [data, setData] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");

  const showAlert = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.sort) params.sort = filters.sort;

      const res = await axios.get(`${apiUrl}/api/admin/reports/revenue`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setData(res.data.report || []);
      setTotalRevenue(res.data.totalRevenue || 0);
    } catch (err) {
      console.error('Error fetching revenue report:', err);
      showAlert(err.response?.data?.message || 'Failed to fetch report', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 mb-8">
      <h2 className="text-xl font-semibold mb-2">Revenue Report</h2>
      <div className="flex flex-wrap gap-2 mb-2">
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="border p-2"
        >
          <option value="">All types</option>
          <option value="workshop">Workshop</option>
          <option value="trip">Trip</option>
          <option value="bazaar">Bazaar</option>
          <option value="booth">Booth</option>
        </select>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          className="border p-2"
          placeholder="Start Date"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="border p-2"
          placeholder="End Date"
        />
        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          className="border p-2"
        >
          <option value="">No sorting</option>
          <option value="asc">Low to High</option>
          <option value="desc">High to Low</option>
        </select>
        <button
          onClick={fetchReport}
          className="bg-indigo-600 text-white px-3 py-2 rounded"
        >
          {loading ? 'Loading...' : 'Generate'}
        </button>
      </div>

      {data && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Title</th>
                  <th className="p-2 border">Type</th>
                  <th className="p-2 border">Start</th>
                  <th className="p-2 border">End</th>
                  <th className="p-2 border">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id} className="text-center">
                    <td className="p-2 border">{r.title}</td>
                    <td className="p-2 border capitalize">{r.type}</td>
                    <td className="p-2 border">{r.startDate ? new Date(r.startDate).toLocaleDateString() : '-'}</td>
                    <td className="p-2 border">{r.endDate ? new Date(r.endDate).toLocaleDateString() : '-'}</td>
                    <td className="p-2 border font-semibold text-indigo-700">${r.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-indigo-100 rounded-lg border-l-4 border-indigo-600">
            <h3 className="text-lg font-bold text-indigo-800">
              Total Revenue: ${totalRevenue.toFixed(2)}
            </h3>
          </div>
        </>
      )}

      {alertMessage && (
        <ModernAlert
          message={alertMessage}
          type={alertType}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </div>
  );
}
