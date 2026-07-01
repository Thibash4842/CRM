const COLOR_MAP = {
  slate: 'bg-slate-500',
  gray: 'bg-gray-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  amber: 'bg-amber-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  emerald: 'bg-emerald-500',
  teal: 'bg-teal-500',
  cyan: 'bg-cyan-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
  purple: 'bg-purple-500',
  fuchsia: 'bg-fuchsia-500',
  pink: 'bg-pink-500',
  rose: 'bg-rose-500'
};

export default function Badge({ children, color = 'bg-slate-500', className = '' }) {
  // Map simple color strings (like "yellow") to explicit tailwind classes (like "bg-yellow-500")
  // We must do this explicitly so Tailwind's JIT compiler can detect the class names.
  const bgClass = color.startsWith('bg-') ? color : (COLOR_MAP[color] || 'bg-slate-500');
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${bgClass} ${className}`}>
      {children}
    </span>
  );
}
