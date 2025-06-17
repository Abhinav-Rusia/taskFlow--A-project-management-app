// components/Spinner.jsx
const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      <p className="text-slate-600 text-sm">Loading...</p>
    </div>
  </div>
);
export default Spinner;
