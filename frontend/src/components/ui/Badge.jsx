export default function Badge({ children, color = 'bg-slate-500', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${color} ${className}`}>
      {children}
    </span>
  );
}
