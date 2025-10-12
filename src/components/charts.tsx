'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig
} from '@/components/ui/chart';
import type { Alert } from '@/lib/types';
import { format } from 'date-fns';

interface GasLevelChartProps {
  alerts: Alert[];
}

const chartConfig = {
  gas_value: {
    label: 'Gas Level',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;


export function GasLevelChart({ alerts }: GasLevelChartProps) {
    const chartData = alerts.map(alert => ({
        date: format(new Date(alert.created_at), 'MMM d, HH:mm'),
        gas_value: alert.sensor_data.gas_value,
    })).reverse(); // reverse to show oldest first

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gas Level History</CardTitle>
        <CardDescription>Recent gas level readings from the device.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 6)}
            />
            <YAxis />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="gas_value" fill="var(--color-gas_value)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
