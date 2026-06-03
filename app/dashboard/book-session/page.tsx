export default function BookSessionPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Book a Session</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Book a 1-on-1 Session</h3>
        <p className="text-slate-500">Connect with our expert tutors for personalized learning.</p>
        <button className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
          View Availability
        </button>
      </div>
    </div>
  );
}
