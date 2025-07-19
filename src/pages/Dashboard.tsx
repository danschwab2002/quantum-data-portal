import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNavigate } from "react-router-dom"
import { Plus, TrendingUp, Users, Target, DollarSign } from "lucide-react"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { ChartWidget } from "@/components/dashboard/ChartWidget"

const Dashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")

  const metrics = [
    {
      title: "Total Leads",
      value: "1,234",
      change: "+12.5%",
      trend: "up" as const,
      icon: Users,
      description: "This month"
    },
    {
      title: "Appointments Set",
      value: "847",
      change: "+8.2%",
      trend: "up" as const,
      icon: Target,
      description: "This month"
    },
    {
      title: "Conversion Rate",
      value: "68.7%",
      change: "-2.1%",
      trend: "down" as const,
      icon: TrendingUp,
      description: "This month"
    },
    {
      title: "Revenue",
      value: "$24,680",
      change: "+15.3%",
      trend: "up" as const,
      icon: DollarSign,
      description: "This month"
    },
  ]

  const chartData = [
    { name: "Jan", leads: 850, appointments: 580, revenue: 18500 },
    { name: "Feb", leads: 920, appointments: 640, revenue: 20200 },
    { name: "Mar", leads: 1050, appointments: 720, revenue: 22800 },
    { name: "Apr", leads: 980, appointments: 690, revenue: 21600 },
    { name: "May", leads: 1150, appointments: 810, revenue: 25400 },
    { name: "Jun", leads: 1234, appointments: 847, revenue: 24680 },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your appointment setter performance</p>
        </div>
        <Button 
          onClick={() => navigate('/sql-editor')}
          className="bg-primary hover:bg-primary/90 shadow-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Widget
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="ai-performance">AI Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartWidget
              title="Leads vs Appointments"
              type="line"
              data={chartData}
              dataKeys={["leads", "appointments"]}
              colors={["hsl(var(--chart-1))", "hsl(var(--chart-2))"]}
            />
            <ChartWidget
              title="Monthly Revenue"
              type="bar"
              data={chartData}
              dataKeys={["revenue"]}
              colors={["hsl(var(--chart-1))"]}
            />
          </div>

          {/* Performance Table */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-muted-foreground font-medium">Date</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Leads</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Appointments</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Conversion</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.slice(-5).map((row, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="py-3 text-foreground">{row.name} 2024</td>
                        <td className="py-3 text-foreground">{row.leads}</td>
                        <td className="py-3 text-foreground">{row.appointments}</td>
                        <td className="py-3 text-foreground">{((row.appointments / row.leads) * 100).toFixed(1)}%</td>
                        <td className="py-3 text-foreground">${row.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads">
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle>Lead Generation Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Lead-specific analytics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-performance">
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle>AI Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">AI performance metrics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Revenue analytics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Dashboard