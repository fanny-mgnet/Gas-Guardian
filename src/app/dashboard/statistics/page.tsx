'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  BarChart as BarChartIcon,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

export default function StatisticsPage() {

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
              <Calendar className="mr-2 h-4 w-4" />
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
