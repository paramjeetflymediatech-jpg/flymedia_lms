export default function PackagesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Packages</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">No active packages</h3>
        <p className="text-slate-500">You don't have any active packages at the moment.</p>
      </div>
    </div>
  );
}
