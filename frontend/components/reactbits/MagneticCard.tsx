export function MagneticCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass rounded-xl transition duration-150 hover:-translate-y-0.5 hover:border-neutral-950 ${className}`}>
      {children}
    </div>
  );
}
