export default function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs font-medium">
      {children}
    </span>
  );
}
