export function RevealText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`shimmer-text ${className}`}>{children}</span>;
}
