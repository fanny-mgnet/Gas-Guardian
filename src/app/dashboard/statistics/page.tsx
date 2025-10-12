'use client';

import { useState } from 'react';
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

const weeklyTrendData = [
    { day: 'Mon', value: 35 },
    { day: 'Tue', value: 42 },
    { day: 'Wed', value: 38 },
    { day: 'Thu', value: 45 },
    { day: 'Fri', value: 51 },
    { day: 'Sat', value: 48 },
    { day: 'Sun', value: 55 },
];

const deviceComparisonData = [
    { name: 'Kitchen', value: 42, fill: 'var(--color-kitchen)' },
    { name: 'Living Room', value: 38, fill: 'var(--color-living-room)' },
    { name: 'Basement', value: 68, fill: 'var(--color-basement)' },
    { name: 'Garage', value: 52, fill: 'var(--color-garage)' },
];
  
const deviceComparisonConfig = {
    value: {
        label: "Gas Level",
    },
    kitchen: {
        label: "Kitchen",
        color: "#3b82f6",
    },
    'living-room': {
        label: "Living Room",
        color: "#10b981",
    },
    basement: {
        label: "Basement",
        color: "#ef4444",
    },
    garage: {
        label: "Garage",
        color: "#f97316",
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
    const [currentMonth, setCurrentMonth] = useState(new Date(2025, 9, 1)); // October 2025
    const [activeFilter, setActiveFilter] = useState('Week');

    const dailyGasData: Record<string, number> = {
        '2025-10-01': 25, '2025-10-02': 35, '2025-10-03': 42, '2025-10-04': 38, '2025-10-05': 55,
        '2025-10-06': 31, '2025-10-07': 33, '2025-10-08': 41, '2025-10-09': 28, '2025-10-10': 60,
        '2025-10-11': 45, '2025-10-12': 29, '2025-10-13': 48, '2025-10-14': 22, '2025-10-15': 51,
        '2025-10-16': 49, '2025-10-17': 36, '2025-10-18': 58, '2025-10-19': 40, '2025-10-20': 34,
        '2025-10-25': 5, '2025-10-26': 5,
      };

      const getDayStatus = (date: Date) => {
        const dateString = format(date, 'yyyy-MM-dd');
        const level = dailyGasData[dateString];
        if (level === undefined) return 'default';
        if (level > 50) return 'high';
        if (level > 30) return 'moderate';
        return 'safe';
      };

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
              {['Today', 'Week', 'Month', 'Year'].map(filter => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? 'default' : 'ghost'}
                  onClick={() => setActiveFilter(filter)}
                  className="w-full rounded-full"
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
                            <LineChart data={weeklyTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
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
                value="45.2"
                unit="ppm"
                change="+8.7%"
                changeType="increase"
                iconBg="bg-blue-100 dark:bg-blue-900/50"
              />
              <SmallStatCard
                icon={TrendingUp}
                title="Peak Reading"
                value="68.3"
                unit="ppm"
                change="+15.2%"
                changeType="increase"
                iconBg="bg-orange-100 dark:bg-orange-900/50"
              />
              <SmallStatCard
                icon={ShieldCheck}
                title="Safe Hours"
                value="18.5"
                unit="hrs"
                change="+18.5%"
                changeType="decrease"
                iconBg="bg-green-100 dark:bg-green-900/50"
              />
              <SmallStatCard
                icon={AlertTriangle}
                title="Alerts"
                value="3"
                unit="times"
                change="-15.8%"
                changeType="decrease"
                iconBg="bg-yellow-100 dark:bg-yellow-900/50"
              />
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Device Comparison</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deviceComparisonData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
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
                                    {deviceComparisonData.map((entry) => (
                                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center items-center flex-wrap gap-4 mt-4 text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: deviceComparisonConfig.kitchen.color}}></span>
                            <span>Kitchen Sensor (42.5 ppm)</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: deviceComparisonConfig['living-room'].color}}></span>
                            <span>Living Room (38.2 ppm)</span>
                        </div>
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: deviceComparisonConfig.basement.color}}></span>
                            <span>Basement (68.3 ppm)</span>
                        </div>
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: deviceComparisonConfig.garage.color}}></span>
                            <span>Garage (52.7 ppm)</span>
                        </div>
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
                        value="18"
                        subtitle="Safe Days"
                        cardClass="bg-green-500/10 border-green-500/20"
                    />
                     <MonthlySummaryCard
                        icon={ShieldAlert}
                        iconColor="text-yellow-500"
                        title="Warning Days"
                        value="8"
                        subtitle="Warning Days"
                        cardClass="bg-yellow-500/10 border-yellow-500/20"
                    />
                     <MonthlySummaryCard
                        icon={AlertTriangle}
                        iconColor="text-red-500"
                        title="High Risk Days"
                        value="4"
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
