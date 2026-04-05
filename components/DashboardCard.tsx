import { ReactNode } from "react";

export default function DashboardCard({
  title,
  children,
  accentClass = "",
}: {
  title: string;
  children: ReactNode;
  accentClass?: string;
}) {
  return (
    <div className={`opennest-card ${accentClass}`}>
      <div className="opennest-card-title">{title}</div>
      <div>{children}</div>
    </div>
  );
}