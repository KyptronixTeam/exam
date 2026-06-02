import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, ClipboardList, HelpCircle, Loader2 } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

export const DashboardManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_statistics');
      if (error) throw error;
      setStats(data);
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-primary/20 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="border-primary/20 shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
          <Card className="border-primary/20 shadow-sm md:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full rounded-md" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20 shadow-sm bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <div className="h-4 w-4 text-muted-foreground flex items-center justify-center font-bold font-mono">%</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore || 0}%</div>
          </CardContent>
        </Card>
        <Card className="border-primary/20 shadow-sm bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.submissions}</div>
          </CardContent>
        </Card>
        <Card className="border-primary/20 shadow-sm bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Bank</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mcqs}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Roles Breakdown */}
        <Card className="border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle>Submissions by Role</CardTitle>
            <CardDescription>Distribution of applied roles</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {stats.rolesData && stats.rolesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.rolesData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip 
                    cursor={{fill: 'transparent'}} 
                    contentStyle={{ borderRadius: '8px', backgroundColor: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
                    formatter={(value: number) => [value, 'Submissions']}
                    labelFormatter={(label) => `Role: ${label}`}
                  />
                  <Bar dataKey="value" name="Submissions" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {stats.rolesData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card className="border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle>Submissions Status</CardTitle>
            <CardDescription>Current status of all tests</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {stats.statusData && stats.statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.statusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Submissions Trend */}
        <Card className="border-primary/20 shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Submissions (Last 7 Days)</CardTitle>
            <CardDescription>Activity trend over the past week</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {stats.trendData && stats.trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.trendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="submissions" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
