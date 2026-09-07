import { Card } from "@/components/ui/Card";

export interface StatItem {
  label: string;
  value: string;
  hint?: string;
}

interface StatsCardsProps {
  stats: StatItem[];
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div
      className={`grid gap-4 ${
        stats.length >= 4
          ? "sm:grid-cols-2 lg:grid-cols-4"
          : "sm:grid-cols-3"
      }`}
    >
      {stats.map((stat) => (
        <Card key={stat.label}>
          <p className="text-sm text-gray-500">{stat.label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
          {stat.hint && (
            <p className="mt-1 text-xs text-gray-400">{stat.hint}</p>
          )}
        </Card>
      ))}
    </div>
  );
}
