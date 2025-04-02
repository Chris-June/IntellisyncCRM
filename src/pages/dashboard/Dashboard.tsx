import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Users,
  BriefcaseBusiness,
  BarChart3,
  FileCheck,
  ThumbsUp,
  AlertTriangle,
  CalendarClock,
  CheckCircle2
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

// Sample data - would be replaced with real API data
const sampleSalesData = [
  { month: 'Jan', leads: 40, opportunities: 24, closed: 10 },
  { month: 'Feb', leads: 28, opportunities: 18, closed: 8 },
  { month: 'Mar', leads: 35, opportunities: 20, closed: 12 },
  { month: 'Apr', leads: 32, opportunities: 20, closed: 9 },
  { month: 'May', leads: 38, opportunities: 22, closed: 11 },
  { month: 'Jun', leads: 42, opportunities: 28, closed: 15 },
];

const sampleProjectHealthData = [
  { name: 'On Track', value: 65, color: 'var(--chart-2)' },
  { name: 'At Risk', value: 25, color: 'var(--chart-4)' },
  { name: 'Delayed', value: 10, color: 'var(--chart-1)' },
];

const sampleTaskCompletionData = [
  { date: '06/01', completed: 12, total: 18 },
  { date: '06/02', completed: 8, total: 15 },
  { date: '06/03', completed: 14, total: 20 },
  { date: '06/04', completed: 10, total: 16 },
  { date: '06/05', completed: 7, total: 12 },
  { date: '06/06', completed: 15, total: 22 },
  { date: '06/07', completed: 18, total: 25 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalClients: 0,
    activeProjects: 0,
    pendingTasks: 0,
    upcomingMilestones: 0,
  });

  useEffect(() => {
    // Simulate loading data
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, we would fetch data from our API
        // const data = await apiClient.get('/api/dashboard/stats');
        
        // Simulate API response with sample data
        setTimeout(() => {
          setDashboardStats({
            totalClients: 34,
            activeProjects: 12,
            pendingTasks: 48,
            upcomingMilestones: 8,
          });
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Welcome back, {user?.email}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Clients"
          value={dashboardStats.totalClients}
          description="Active client accounts"
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
          loading={isLoading}
        />
        <StatsCard
          title="Active Projects"
          value={dashboardStats.activeProjects}
          description="Projects in progress"
          icon={<BriefcaseBusiness className="h-5 w-5 text-muted-foreground" />}
          loading={isLoading}
        />
        <StatsCard
          title="Pending Tasks"
          value={dashboardStats.pendingTasks}
          description="Tasks awaiting completion"
          icon={<FileCheck className="h-5 w-5 text-muted-foreground" />}
          loading={isLoading}
        />
        <StatsCard
          title="Upcoming Milestones"
          value={dashboardStats.upcomingMilestones}
          description="Due in the next 7 days"
          icon={<CalendarClock className="h-5 w-5 text-muted-foreground" />}
          loading={isLoading}
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Pipeline</TabsTrigger>
          <TabsTrigger value="projects">Project Health</TabsTrigger>
          <TabsTrigger value="tasks">Task Completion</TabsTrigger>
        </TabsList>

        {/* Sales Pipeline Chart */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCardSmall
              title="Open Leads"
              value="24"
              description="+4 this week"
              status="increase"
              loading={isLoading}
            />
            <StatCardSmall
              title="Qualified Opportunities"
              value="18"
              description="+2 this week"
              status="increase"
              loading={isLoading}
            />
            <StatCardSmall
              title="Pipeline Value"
              value="$345K"
              description="+$45K this week"
              status="increase"
              loading={isLoading}
            />
            <StatCardSmall
              title="Win Rate"
              value="68%"
              description="+3% vs last month"
              status="increase"
              loading={isLoading}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sales Pipeline Trends</CardTitle>
              <CardDescription>
                Month-over-month lead, opportunity, and closed deal counts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sampleSalesData} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="leads" name="Leads" fill="hsl(var(--chart-1))" />
                      <Bar dataKey="opportunities" name="Opportunities" fill="hsl(var(--chart-2))" />
                      <Bar dataKey="closed" name="Closed Deals" fill="hsl(var(--chart-3))" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Health Chart */}
        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCardSmall
              title="On Schedule"
              value="87%"
              description="of milestones"
              status="positive"
              loading={isLoading}
            />
            <StatCardSmall
              title="Resource Utilization"
              value="76%"
              description="+5% vs target"
              status="positive"
              loading={isLoading}
            />
            <StatCardSmall
              title="Budget Variance"
              value="-2.4%"
              description="Under budget"
              status="positive"
              loading={isLoading}
            />
            <StatCardSmall
              title="Client Satisfaction"
              value="4.8/5"
              description="Based on feedback"
              status="positive"
              loading={isLoading}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Health Distribution</CardTitle>
                <CardDescription>
                  Current health status across all projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {isLoading ? (
                    <Skeleton className="w-full h-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sampleProjectHealthData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {sampleProjectHealthData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>At-Risk Projects</CardTitle>
                <CardDescription>
                  Projects requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">Mobile App Development</p>
                        <p className="text-sm text-muted-foreground">Resource shortage</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-amber-500">Medium Risk</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">AI Integration Platform</p>
                        <p className="text-sm text-muted-foreground">Timeline slippage</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-red-500">High Risk</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Task Completion Chart */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCardSmall
              title="Completion Rate"
              value="78%"
              description="+5% vs last week"
              status="positive"
              loading={isLoading}
            />
            <StatCardSmall
              title="On-time Delivery"
              value="82%"
              description="+3% vs target"
              status="positive"
              loading={isLoading}
            />
            <StatCardSmall
              title="Overdue Tasks"
              value="8"
              description="-2 from yesterday"
              status="positive"
              loading={isLoading}
            />
            <StatCardSmall
              title="Avg. Resolution Time"
              value="2.4 days"
              description="On target"
              status="neutral"
              loading={isLoading}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Task Completion Trend</CardTitle>
              <CardDescription>
                Daily task completion vs. total assigned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sampleTaskCompletionData} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        name="Completed Tasks"
                        stroke="hsl(var(--chart-2))"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        name="Total Tasks"
                        stroke="hsl(var(--chart-5))"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates across your projects and clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <ActivityItem
                icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                title="Website Redesign Project completed"
                description="Final deliverables approved by Acme Corporation"
                timestamp="2 hours ago"
              />
              <ActivityItem
                icon={<BriefcaseBusiness className="h-5 w-5 text-blue-500" />}
                title="New lead created"
                description="Tech Solutions Inc. interested in AI consulting services"
                timestamp="5 hours ago"
              />
              <ActivityItem
                icon={<ThumbsUp className="h-5 w-5 text-amber-500" />}
                title="Proposal accepted"
                description="Global Innovations approved our service proposal"
                timestamp="Yesterday"
              />
              <ActivityItem
                icon={<CalendarClock className="h-5 w-5 text-purple-500" />}
                title="Milestone approaching"
                description="Initial prototype delivery due in 2 days"
                timestamp="Yesterday"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  loading?: boolean;
}

function StatsCard({ title, value, description, icon, loading = false }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-9 w-20 mt-1" />
            ) : (
              <p className="text-3xl font-bold">{value}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="p-2 bg-secondary rounded-lg">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardSmallProps {
  title: string;
  value: string;
  description: string;
  status: 'increase' | 'decrease' | 'positive' | 'negative' | 'neutral';
  loading?: boolean;
}

function StatCardSmall({ title, value, description, status, loading = false }: StatCardSmallProps) {
  let statusColor = 'text-muted-foreground';
  let statusIcon = null;

  switch (status) {
    case 'increase':
    case 'positive':
      statusColor = 'text-green-500';
      statusIcon = <span className="mr-1">↑</span>;
      break;
    case 'decrease':
    case 'negative':
      statusColor = 'text-red-500';
      statusIcon = <span className="mr-1">↓</span>;
      break;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {loading ? (
          <Skeleton className="h-7 w-16 mt-1" />
        ) : (
          <p className="text-xl font-semibold">{value}</p>
        )}
        <p className={`text-xs ${statusColor} mt-1 flex items-center`}>
          {statusIcon}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  timestamp: string;
}

function ActivityItem({ icon, title, description, timestamp }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
      <div className="mt-1">{icon}</div>
      <div className="flex-1 space-y-1">
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="text-xs text-muted-foreground whitespace-nowrap">{timestamp}</div>
    </div>
  );
}