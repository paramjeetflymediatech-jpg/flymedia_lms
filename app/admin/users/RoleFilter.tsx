"use client";

import { useRouter, useSearchParams } from 'next/navigation';

export default function RoleFilter({ initialRole }: { initialRole: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (role === 'ALL') {
      params.delete('role');
    } else {
      params.set('role', role);
    }
    
    params.delete('page'); // Reset page when filtering

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="role" className="block text-sm font-bold text-slate-700 whitespace-nowrap">Role Filter:</label>
      <select 
        id="role"
        value={initialRole}
        onChange={handleRoleChange}
        className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 bg-slate-50 cursor-pointer min-w-[150px]"
      >
        <option value="ALL">All Users</option>
        <option value="STUDENT">Students</option>
        <option value="TUTOR">Tutors</option>
        <option value="ADMIN">Admins</option>
      </select>
    </div>
  );
}
