import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
}

export default function DashboardCard({ title, children }: DashboardCardProps) {
  return (
    <div className="module-card">
      <h2 className="module-section-title">{title}</h2>
      {children}
    </div>
  );
}