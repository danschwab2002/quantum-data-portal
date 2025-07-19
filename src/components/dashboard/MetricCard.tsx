import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: LucideIcon
  description: string
}

export function MetricCard({ title, value, change, trend, icon: Icon, description }: MetricCardProps) {
  return (
    <Card className="bg-card border-border shadow-card hover:shadow-glow transition-smooth">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className={`flex items-center gap-1 text-sm ${
            trend === "up" ? "text-green-500" : "text-red-500"
          }`}>
            {trend === "up" ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {change}
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}