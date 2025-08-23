"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function UserProgressDetail() {
  const params = useParams();
  const user_id = params?.user_id as string;
  const [paths, setPaths] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/admin/progress/users/${user_id}/detail`);
      const data = await res.json();
      if (data?.success) {
        setPaths(data.data?.paths || []);
        setCourses(data.data?.courses || []);
      }
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { if (user_id) fetchDetail(); }, [user_id]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Progress Detail</h1>
      {loading && <div>Loading...</div>}
      {!loading && paths.length === 0 && courses.length === 0 && <div>No data</div>}

      <h2 className="text-xl font-semibold mt-4 mb-2">Paths</h2>
      <table className="min-w-full border mb-6">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="text-left p-2">Path</th>
            <th className="text-left p-2">State</th>
            <th className="text-left p-2">Started</th>
            <th className="text-left p-2">Finished</th>
          </tr>
        </thead>
        <tbody>
          {paths.map((r, idx) => (
            <tr key={idx} className="border-b">
              <td className="p-2">{r.path_id}</td>
              <td className="p-2">{r.state}</td>
              <td className="p-2">{r.started_at ? new Date(r.started_at).toLocaleString() : '-'}</td>
              <td className="p-2">{r.finished_at ? new Date(r.finished_at).toLocaleString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-semibold mt-4 mb-2">Courses</h2>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="text-left p-2">Course</th>
            <th className="text-left p-2">State</th>
            <th className="text-left p-2">Started</th>
            <th className="text-left p-2">Finished</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((r, idx) => (
            <tr key={idx} className="border-b">
              <td className="p-2">{r.course_id}</td>
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
