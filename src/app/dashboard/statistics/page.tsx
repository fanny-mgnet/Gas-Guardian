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
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  AlertCircle
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
} from 'recharts';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Calendar } from '@/components/ui/calendar';
import { format, addMonths, subMonths } from 'date-fns';

const deviceComparisonData = [
  { name: 'Kitchen', value: 42, color: 'hsl(var(--chart-1))' },
  { name: 'Living Room', value: 38, color: 'hsl(var(--chart-3))' },
  { name: 'Basement', value: 65, color: 'hsl(var(--destructive))' },
  { name: 'Garage', value: 52, color: 'hsl(var(--chart-2))' },
];

function BigStatCard({ title, value, unit }: { title: string, value: string, unit: string }) {
    return (
        <Card className="shadow-sm flex-1">
            <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-3xl font-bold">
                    {value}
                    <span className="text-xl font-medium text-muted-foreground ml-1">{unit}</span>
                </p>
            </CardContent>
        </Card>
    );
}

function SmallStatCard({
  icon: Icon,
  title,
  value,
  unit,
  change,
  changeType,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  unit: string;
  change: string;
  changeType: 'increase' | 'decrease';
}) {
  return (
    <Card className="shadow-sm flex-1">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
                <Icon className="h-5 w-5" />
            </div>
            <div
                className={cn(
                'flex items-center text-xs font-semibold px-2 py-1 rounded-full',
                changeType === 'increase'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                )}
            >
                {changeType === 'increase' ? (
                <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                <TrendingUp className="h-3 w-3 mr-1" />
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

function LegendItem({ color, label, value }: { color: string, label: string, value: string }) {
    return (
        <Button variant="outline" className="h-auto py-2 px-3 border-2 rounded-lg" style={{ borderColor: color }}>
            <span className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: color }}></span>
            <div className="flex flex-col items-start">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="font-bold text-sm text-foreground">{value}</span>
            </div>
        </Button>
    )
}

function MonthlySummaryCard({ icon: Icon, iconColor, title, value, footer }: { icon: React.ElementType, iconColor: string, title: string, value: string, footer: string }) {
    return (
        <Card className="flex-1">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <Icon className={cn("h-5 w-5", iconColor)} />
                </div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{footer}</p>
            </CardContent>
        </Card>
    );
}

export default function StatisticsPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date(2025, 9, 1)); // October 2025

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

            <div className="flex gap-4">
                <BigStatCard title="Average Level" value="32.5" unit="ppm" />
                <BigStatCard title="Peak Reading" value="52.8" unit="ppm" />
            </div>

            <div className="flex gap-4">
              <SmallStatCard
                icon={ShieldCheck}
                title="Safe Hours"
                value="18.5"
                unit="hrs"
                change="+12.3%"
                changeType="increase"
              />
              <SmallStatCard
                icon={AlertTriangle}
                title="Alerts"
                value="3"
                unit="times"
                change="-25.0%"
                changeType="decrease"
              />
            </div>
            
            <Card className="shadow-sm">
                <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2">Device Comparison</h3>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deviceComparisonData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 'var(--radius)',
                                    }}
                                    cursor={{fill: 'hsla(var(--muted-foreground), 0.1)'}}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {deviceComparisonData.map((entry, index) => (
                                        <rect key={`cell-${index}`} x={entry.value} y={entry.value} width={entry.value} height={entry.value} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                     <div className="flex justify-around items-center flex-wrap gap-2 mt-4 text-xs">
                        <LegendItem color="hsl(var(--chart-1))" label="Kitchen Sensor" value="42.5 ppm" />
                        <LegendItem color="hsl(var(--chart-3))" label="Living Room" value="38.2 ppm" />
                        <LegendItem color="hsl(var(--destructive))" label="Basement" value="65.1 ppm" />
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
                    <CardDescription>Overview for {format(currentMonth, 'MMMM')}</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <MonthlySummaryCard
                        icon={CheckCircle2}
                        iconColor="text-green-500"
                        title="Safe Days"
                        value="23"
                        footer="Below threshold"
                    />
                     <MonthlySummaryCard
                        icon={AlertCircle}
                        iconColor="text-yellow-500"
                        title="Warning Days"
                        value="5"
                        footer="Moderate levels"
                    />
                     <MonthlySummaryCard
                        icon={Flame}
                        iconColor="text-red-500"
                        title="Danger Days"
                        value="3"
                        footer="High level alerts"
                    />
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
