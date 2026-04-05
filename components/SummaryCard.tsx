export default function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="opennest-summary-card">
      <div className="opennest-summary-label">{label}</div>
      <div className="opennest-summary-value">{value}</div>
    </div>
  );
}