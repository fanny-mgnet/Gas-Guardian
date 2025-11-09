'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Share2,
  BarChart as BarChartIcon,
  Calendar as CalendarIcon,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldAlert,
  BarChartHorizontal,
  ArrowUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Calendar } from '@/components/ui/calendar';
import { format, addMonths, subMonths } from 'date-fns';
import { ChartContainer } from '@/components/ui/chart';
import { getStatisticsData } from '@/lib/actions';
import { FilterType, StatisticsData, SummaryStats, TrendDataPoint, DeviceComparisonDataPoint, DailyGasData } from '@/lib/types';
// import { useDoc } from '@/supabase/use-doc'; // Temporarily removed to fix compilation

// Define initial empty state for StatisticsData
const initialStatsData: StatisticsData = {
    trendData: [],
    summaryStats: {
        average: { value: '0.0', unit: 'ppm', change: '0%', type: 'neutral' },
        peak: { value: '0.0', unit: 'ppm', change: '0%', type: 'neutral' },
        safe: { value: '0.0', unit: 'hrs', change: '0%', type: 'neutral' },
        alerts: { value: '0', unit: 'times', change: '0%', type: 'neutral' },
    },
    deviceComparisonData: [],
    dailyGasData: {},
};

const CHART_COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
];

// Base config for ChartContainer
const baseDeviceComparisonConfig = {
    value: {
        label: "Gas Level",
    },
}
  
function SmallStatCard({
  icon: Icon,
  title,
  value,
  unit,
  change,
  changeType,
  iconBg,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  unit: string;
  change: string;
  changeType: 'increase' | 'decrease';
  iconBg?: string;
}) {
  return (
    <Card className="shadow-sm flex-1">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
            <div className={cn("text-primary p-2 rounded-lg", iconBg || 'bg-primary/10')}>
                <Icon className="h-5 w-5" />
            </div>
            <div
                className={cn(
                'flex items-center text-xs font-semibold px-2 py-1 rounded-full',
                changeType === 'increase'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-green-100 text-green-600'
                )}
            >
                {changeType === 'increase' ? (
                <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {change}
            </div>
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">
                {value}
                <span className="text-base font-medium text-muted-foreground ml-1">{unit}</span>
            </p>
        </div>
      </CardContent>
    </Card>
  );
}

function MonthlySummaryCard({ icon: Icon, iconColor, title, value, subtitle, cardClass }: { icon: React.ElementType, iconColor?: string, title: string, value: string, subtitle: string, cardClass?: string }) {
    return (
        <Card className={cn("flex-1 text-center", cardClass)}>
            <CardContent className="p-4 flex flex-col items-center justify-center">
                <Icon className={cn("h-6 w-6 mb-2", iconColor)} />
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
            </CardContent>
        </Card>
    );
}

export default function StatisticsPage() {
    // NOTE: Using a placeholder for userId to isolate the server action error.
    const userId = 'placeholder-user-id';

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [activeFilter, setActiveFilter] = useState<FilterType>('week');
    const [statsData, setStatsData] = useState<StatisticsData>(initialStatsData);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (filter: FilterType) => {
        if (!userId) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await getStatisticsData(filter, userId);
            setStatsData(data);
        } catch (e) {
            console.error("Failed to fetch statistics data:", e);
            setError("Failed to load statistics data.");
            setStatsData(initialStatsData);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchData(activeFilter);
    }, [activeFilter, fetchData]);

    // Helper function to get the status of a day for the calendar view
    const getDayStatus = (date: Date) => {
        const dateString = format(date, 'yyyy-MM-dd');
        const level = statsData.dailyGasData[dateString];
        if (level === undefined) return 'default';
        if (level > 50) return 'high';
        if (level > 30) return 'moderate';
        return 'safe';
    };

    // Calculate Monthly Summary based on fetched dailyGasData for the current month
    const calculateMonthlySummary = () => {
        let safeDays = 0;
        let moderateDays = 0;
        let highRiskDays = 0;

        const startOfMonth = format(currentMonth, 'yyyy-MM');

        for (const dateString in statsData.dailyGasData) {
            if (dateString.startsWith(startOfMonth)) {
                const level = statsData.dailyGasData[dateString];
                if (level > 50) {
                    highRiskDays++;
                } else if (level > 30) {
                    moderateDays++;
                } else {
                    safeDays++;
                }
            }
        }
        return { safeDays, moderateDays, highRiskDays };
    };

    const monthlySummary = calculateMonthlySummary();

    if (isLoading) {
        // Simple loading state
        return (
            <div className="p-4 text-center">
                <p>Loading statistics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-500">
                <p>{error}</p>
            </div>
        );
    }

      const DayWithStatus = ({ date, ...props }: { date: Date } & React.HTMLAttributes<HTMLDivElement>) => {
        const status = getDayStatus(date);
        const baseClasses = "w-9 h-9 flex items-center justify-center rounded-full";
        const statusClasses = {
          safe: 'bg-green-100 text-green-800',
          moderate: 'bg-orange-100 text-orange-800',
          high: 'bg-red-100 text-red-800',
          default: ''
        };
      
        return (
          <div {...props}>
            <div className={cn(baseClasses, statusClasses[status])}>
              {format(date, 'd')}
            </div>
          </div>
        );
      };

  return (
    <div className="bg-background min-h-screen pb-24">
      <header className="bg-card p-4 flex items-center justify-between border-b sticky top-0 z-10">
        <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
                <ArrowLeft />
            </Link>
        </Button>
        <h1 className="text-lg font-semibold">Gas Statistics</h1>
        <Button variant="ghost" size="icon">
          <Share2 className="h-5 w-5" />
        </Button>
      </header>

      <div className="p-4 space-y-4">
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analytics">
              <BarChartIcon className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>
          <TabsContent value="analytics" className="space-y-4">
            <div className="flex justify-between items-center bg-muted p-1 rounded-full">
              {(['today', 'week', 'month', 'year'] as FilterType[]).map(filter => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? 'default' : 'ghost'}
                  onClick={() => setActiveFilter(filter)}
                  className="w-full rounded-full capitalize"
                >
                  {filter}
                </Button>
              ))}
            </div>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Gas Level Trend</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={statsData.trendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 'var(--radius)',
                                    }}
                                    cursor={{stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: "3 3"}}
                                />
                                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                     <div className="flex justify-center items-center flex-wrap gap-4 mt-4 text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                            <span>Safe</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="h-2.5 w-2.5 rounded-full bg-primary"></span>
                            <span>Warning</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="h-2.5 w-2.5 rounded-full bg-destructive"></span>
                            <span>Danger</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <SmallStatCard
                icon={BarChartHorizontal}
                title="Average Level"
                value={statsData.summaryStats.average.value}
                unit={statsData.summaryStats.average.unit}
                change={statsData.summaryStats.average.change}
                changeType={statsData.summaryStats.average.type as 'increase' | 'decrease'}
                iconBg="bg-blue-100 dark:bg-blue-900/50"
              />
              <SmallStatCard
                icon={TrendingUp}
                title="Peak Reading"
                value={statsData.summaryStats.peak.value}
                unit={statsData.summaryStats.peak.unit}
                change={statsData.summaryStats.peak.change}
                changeType={statsData.summaryStats.peak.type as 'increase' | 'decrease'}
                iconBg="bg-orange-100 dark:bg-orange-900/50"
              />
              <SmallStatCard
                icon={ShieldCheck}
                title="Safe Hours"
                value={statsData.summaryStats.safe.value}
                unit={statsData.summaryStats.safe.unit}
                change={statsData.summaryStats.safe.change}
                changeType={statsData.summaryStats.safe.type as 'increase' | 'decrease'}
                iconBg="bg-green-100 dark:bg-green-900/50"
              />
              <SmallStatCard
                icon={AlertTriangle}
                title="Alerts"
                value={statsData.summaryStats.alerts.value}
                unit={statsData.summaryStats.alerts.unit}
                change={statsData.summaryStats.alerts.change}
                changeType={statsData.summaryStats.alerts.type as 'increase' | 'decrease'}
                iconBg="bg-yellow-100 dark:bg-yellow-900/50"
              />
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Device Comparison</CardTitle>
                    <CardDescription>Average gas level comparison across devices in the current period.</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                    <ChartContainer config={baseDeviceComparisonConfig} className="h-[200px] w-full">
                        <BarChart data={statsData.deviceComparisonData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: 'var(--radius)',
                                }}
                                cursor={{fill: 'hsl(var(--muted))', radius: 'var(--radius)'}}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {statsData.deviceComparisonData.map((entry, index) => (
                                    <Cell key={`cell-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                    <div className="flex justify-center items-center flex-wrap gap-4 mt-4 text-xs">
                        {statsData.deviceComparisonData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2 text-muted-foreground">
                                <span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: CHART_COLORS[index % CHART_COLORS.length]}}></span>
                                <span>{entry.name} ({entry.value} ppm)</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

          </TabsContent>
          <TabsContent value="calendar" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Gas Level Overview</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h3 className="font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
                        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <Calendar
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        components={{
                            Day: ({ date }) => date ? <DayWithStatus date={date} /> : null
                        }}
                        className="p-0"
                        classNames={{
                            head_cell: "w-9 text-xs font-normal text-muted-foreground",
                            cell: "w-auto p-0",
                            day: "w-9 h-9",
                        }}
                    />
                    <div className="flex justify-around items-center mt-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-green-200"></span>
                            <span>Safe (&lt;30)</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-orange-200"></span>
                            <span>Moderate (31-50)</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-red-200"></span>
                            <span>High (&gt;50)</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Summary</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <MonthlySummaryCard
                        icon={Shield}
                        iconColor="text-green-500"
                        title="Safe Days"
                        value={monthlySummary.safeDays.toString()}
                        subtitle="Safe Days"
                        cardClass="bg-green-500/10 border-green-500/20"
                    />
                     <MonthlySummaryCard
                        icon={ShieldAlert}
                        iconColor="text-yellow-500"
                        title="Warning Days"
                        value={monthlySummary.moderateDays.toString()}
                        subtitle="Warning Days"
                        cardClass="bg-yellow-500/10 border-yellow-500/20"
                    />
                     <MonthlySummaryCard
                        icon={AlertTriangle}
                        iconColor="text-red-500"
                        title="High Risk Days"
                        value={monthlySummary.highRiskDays.toString()}
                        subtitle="High Risk Days"
                        cardClass="bg-red-500/10 border-red-500/20"
                    />
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

    
