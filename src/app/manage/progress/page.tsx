"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/frontend/auth';

export default function AdminProgressDashboard() {
  const { isAuthenticated } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/admin/progress/paths/summary');
      const data = await res.json();
      if (data?.success) setRows(data.data || []);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { if (isAuthenticated) fetchSummary(); }, [isAuthenticated]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Progress Dashboard</h1>
      {loading && <div>Loading...</div>}
      {!loading && rows.length === 0 && <div>No data</div>}
      <div className="space-y-3">
        {rows.map((r, idx) => (
          <div key={idx} className="border rounded p-3 flex justify-between">
            <div>
              <div className="font-semibold">Path: {r.path_id}</div>
              <div className="text-sm text-gray-600">Total users: {r.total}</div>
            </div>
            <div className="text-sm">
              <div>completed: {r.counts?.completed || 0}</div>
              <div>in_progress: {r.counts?.in_progress || 0}</div>
              <div>not_started: {r.counts?.not_started || 0}</div>
            </div>
            <div>
              <Link className="text-blue-600" href={`/manage/progress/paths/${r.path_id}`}>View details</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
