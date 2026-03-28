interface SummaryCardProps {
  label: string;
  value: string | number;
}

export default function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="module-card">
      <div className="module-card-title">{label}</div>
      <div className="module-card-value">{value}</div>
    </div>
  );
}