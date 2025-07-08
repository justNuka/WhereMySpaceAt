import { Card, CardContent } from "@/components/ui/card";

export default function StatsCard({ title, value, icon, iconColor, iconBg }) {
  return (
    <Card className="glass-card border-white/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
          <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
            <div className={iconColor}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}