'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  BarChart,
  Calendar,
  AreaChart,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Dot,
} from 'recharts';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const chartData = [
    { name: '0:00', value: 15, status: 'safe' },
    { name: '2:00', value: 18, status: 'safe' },
    { name: '4:00', value: 25, status: 'safe' },
    { name: '6:00', value: 28, status: 'safe' },
    { name: '8:00', value: 30, status: 'warning' },
    { name: '10:00', value: 35, status: 'warning' },
    { name: '12:00', value: 38, status: 'warning' },
    { name: '14:00', value: 42, status: 'warning' },
    { name: '16:00', value: 45, status: 'warning' },
    { name: '18:00', value: 48, status: 'warning' },
    { name: '20:00', value: 50, status: 'warning' },
    { name: '22:00', value: 55, status: 'warning' },
];

const getDotColor = (status: string) => {
    switch (status) {
        case 'safe':
            return 'hsl(var(--chart-3))';
        case 'warning':
            return 'hsl(var(--primary))';
        case 'danger':
            return 'hsl(var(--destructive))';
        default:
            return 'hsl(var(--muted-foreground))';
    }
};

const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    return <Dot cx={cx} cy={cy} r={4} fill={getDotColor(payload.status)} stroke={getDotColor(payload.status)} strokeWidth={2} />;
};


function StatCard({
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
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-primary/10 text-primary p-1.5 rounded-md">
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
              <ArrowDown className="h-3 w-3 mr-1" />
            )}
            {change}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">
          {value}
          <span className="text-lg font-medium text-muted-foreground ml-1">{unit}</span>
        </p>
      </CardContent>
    </Card>
  );
}

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState('Today');

  return (
    <div className="bg-background min-h-screen">
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
              <BarChart className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="mr-2 h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>
          <TabsContent value="analytics" className="space-y-4">
            <div className="flex space-x-2 bg-muted p-1 rounded-lg">
              {['Today', 'Week', 'Month', 'Year'].map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'ghost'}
                  onClick={() => setTimeRange(range)}
                  className="flex-1 text-sm h-8 shadow-sm"
                >
                  {range}
                </Button>
              ))}
            </div>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">Gas Level Trend</h3>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                            }}
                        />
                         <defs>
                            <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="30%" stopColor="hsl(var(--chart-3))" />
                                <stop offset="30%" stopColor="hsl(var(--primary))" />
                            </linearGradient>
                        </defs>
                        <Line type="monotone" dataKey="value" stroke="url(#lineColor)" strokeWidth={3} activeDot={{ r: 6 }} dot={<CustomDot />} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                 <div className="flex justify-center items-center space-x-6 mt-4 text-xs">
                    <div className="flex items-center">
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></span>
                        <span>Safe</span>
                    </div>
                    <div className="flex items-center">
                        <span className="h-2.5 w-2.5 rounded-full bg-purple-500 mr-2"></span>
                        <span>Warning</span>
                    </div>
                    <div className="flex items-center">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2"></span>
                        <span>Danger</span>
                    </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={AreaChart}
                title="Average Level"
                value="32.5"
                unit="ppm"
                change="+2.3%"
                changeType="increase"
              />
              <StatCard
                icon={TrendingUp}
                title="Peak Reading"
                value="52.8"
                unit="ppm"
                change="+5.1%"
                changeType="increase"
              />
              <StatCard
                icon={ShieldCheck}
                title="Safe Hours"
                value="18.5"
                unit="hrs"
                change="+12.3%"
                changeType="decrease"
              />
              <StatCard
                icon={AlertTriangle}
                title="Alerts"
                value="3"
                unit="events"
                change="-25.0%"
                changeType="decrease"
              />
            </div>
          </TabsContent>
          <TabsContent value="calendar">
            <Card>
                <CardContent className="p-6">
                    <p>Calendar view coming soon.</p>
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
