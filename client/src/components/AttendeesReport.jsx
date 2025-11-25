import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AttendeesReport() {
  const [filters, setFilters] = useState({ name: '', type: '', startDate: '', endDate: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [eventOptions, setEventOptions] = useState([]);
  const [eventOptionsLoading, setEventOptionsLoading] = useState(false);

  useEffect(() => {
    const fetchEventOptions = async () => {
      try {
        setEventOptionsLoading(true);
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const allowedTypes = ['workshop', 'trip', 'gym'];

        const responses = await Promise.all(
          allowedTypes.map(async (type) => {
            try {
              const res = await axios.get(`${apiUrl}/api/events`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { type },
              });

              return Array.isArray(res.data)
                ? res.data
                : res.data?.events || res.data?.data || [];
            } catch (typeErr) {
              console.error(`Error loading ${type} events for attendees report:`, typeErr);
              return [];
            }
          })
        );

        const eventsArray = responses.flat();

        const uniqueNames = Array.from(
          new Set(
            eventsArray
              .map((event) => event?.title || event?.name || '')
              .filter((name) => Boolean(name?.trim()))
          )
        ).sort((a, b) => a.localeCompare(b));

        setEventOptions(uniqueNames);
      } catch (err) {
        console.error('Error loading events for attendees report:', err);
      } finally {
        setEventOptionsLoading(false);
      }
    };

    fetchEventOptions();
  }, []);

  const handleNameChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      name: value,
      type: value ? '' : prev.type,
    }));
  };

  const handleTypeChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      type: value,
      name: value ? '' : prev.name,
    }));
  };

  const handleReset = () => {
    setFilters({ name: '', type: '', startDate: '', endDate: '' });
    setData(null);
  };

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

  const nameShadowed = Boolean(filters.type);
  const typeShadowed = Boolean(filters.name);

  const sharedInputStyles = (isShadowed) =>
    `border p-2 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      isShadowed ? 'bg-gray-100 text-gray-500 border-gray-200 shadow-inner' : 'bg-white border-gray-300'
    }`;

  return (
    <div className="mt-8 mb-8">
      <h2 className="text-xl font-semibold mb-2">Attendees Report</h2>
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div className="flex flex-col gap-1 min-w-[240px] flex-1">
          <label className="text-sm font-medium text-slate-600">Event</label>
          <div className="relative">
            <input
              type="text"
              list="attendees-report-event-names"
              placeholder={eventOptionsLoading ? 'Loading events...' : 'Search or select event'}
              value={filters.name}
              disabled={nameShadowed}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`${sharedInputStyles(nameShadowed)} min-w-[220px] pr-8 w-full`}
            />
            <datalist id="attendees-report-event-names">
              {eventOptions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            {filters.name && (
              <button
                type="button"
                onClick={() => handleNameChange('')}
                className="absolute inset-y-0 right-2 text-xs text-slate-500 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 min-w-[200px] flex-1">
          <label className="text-sm font-medium text-slate-600">Type</label>
          <div className="relative">
            <select
              value={filters.type}
              disabled={typeShadowed}
              onChange={(e) => handleTypeChange(e.target.value)}
              className={`${sharedInputStyles(typeShadowed)} min-w-[180px] w-full appearance-none pr-8`}
            >
              <option value="">All types</option>
              <option value="workshop">Workshop</option>
              <option value="trip">Trip</option>
              <option value="gym">Gym</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">▾</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 min-w-[170px]">
          <label className="text-sm font-medium text-slate-600">From</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="border p-2 rounded-md border-gray-300"
          />
        </div>
        <div className="flex flex-col gap-1 min-w-[170px]">
          <label className="text-sm font-medium text-slate-600">To</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="border p-2 rounded-md border-gray-300"
          />
        </div>
        <div className="flex gap-2 items-end">
          <button
            onClick={fetchReport}
            className="self-stretch bg-indigo-600 text-white px-4 py-2 rounded-md shadow hover:bg-indigo-700 transition"
          >
            {loading ? 'Loading...' : 'Generate'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="self-stretch text-slate-600 px-3 py-2 rounded-md hover:bg-slate-100"
          >
            Reset
          </button>
        </div>
      </div>

      {data && data.length > 0 && (
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
      {data && data.length === 0 && (
        <p className="text-sm text-slate-500">No data to display.</p>
      )}
    </div>
  );
}
