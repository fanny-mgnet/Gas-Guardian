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
    label: 'Gas Level (Raw)',
    color: 'hsl(var(--chart-1))',
  },
  gas_percentage: {
    label: 'Gas Level (%)',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;


export function GasLevelChart({ alerts }: GasLevelChartProps) {
    const chartData = alerts.map(alert => {
        const sensorData = JSON.parse(alert.sensorData);
        return {
            date: format(new Date(alert.createdAt), 'MMM d, HH:mm'),
            gas_value: sensorData.gas_value,
            gas_percentage: sensorData.gas_percentage,
        };
    }).reverse(); // reverse to show oldest first

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
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar dataKey="gas_value" fill="var(--color-gas_value)" radius={4} />
            <Bar dataKey="gas_percentage" fill="var(--color-gas_percentage)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
