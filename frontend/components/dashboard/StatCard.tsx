import { MagneticCard } from "@/components/reactbits/MagneticCard";

export function StatCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <MagneticCard className="p-5">
      <p className="text-sm font-semibold text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-neutral-950">{value}</p>
      {detail ? <p className="mt-2 text-xs text-neutral-500">{detail}</p> : null}
    </MagneticCard>
  );
}
