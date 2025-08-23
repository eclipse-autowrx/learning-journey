"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function CourseProgressDetail() {
  const params = useParams();
  const course_id = params?.course_id as string;
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/admin/progress/courses/${course_id}/detail`);
      const data = await res.json();
      if (data?.success) setRows(data.data || []);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { if (course_id) fetchDetail(); }, [course_id]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Course Progress Detail</h1>
      {loading && <div>Loading...</div>}
      {!loading && rows.length === 0 && <div>No data</div>}
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="text-left p-2">User</th>
            <th className="text-left p-2">State</th>
            <th className="text-left p-2">Started</th>
            <th className="text-left p-2">Finished</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="border-b">
              <td className="p-2">{r.user_id}</td>
              <td className="p-2">{r.state}</td>
              <td className="p-2">{r.started_at ? new Date(r.started_at).toLocaleString() : '-'}</td>
              <td className="p-2">{r.finished_at ? new Date(r.finished_at).toLocaleString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
