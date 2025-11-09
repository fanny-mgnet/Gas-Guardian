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
import type { Alert, DeviceReading } from '@/lib/types';
import { format } from 'date-fns';

interface GasLevelChartProps {
  readings: DeviceReading[];
}

const chartConfig = {
  gas_value: {
    label: 'Gas Value (Raw)',
    color: 'hsl(var(--chart-1))',
  },
  gas_percentage: {
    label: 'Gas Level (%)',
    color: 'hsl(var(--chart-2))',
  },
  temperature: {
    label: 'Temperature (°C)',
    color: 'hsl(var(--chart-3))',
  },
  humidity: {
    label: 'Humidity (%)',
    color: 'hsl(var(--chart-4))',
  },
  pressure: {
    label: 'Pressure (hPa)',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;


export function GasLevelChart({ readings }: GasLevelChartProps) {
    const chartData = readings.map(reading => ({
        date: format(new Date(reading.createdAt), 'MMM d, HH:mm'),
        gas_value: reading.gas_value,
        gas_percentage: reading.gas_percentage,
        temperature: reading.temperature,
        humidity: reading.humidity,
        pressure: reading.pressure,
    })).reverse(); // reverse to show oldest first

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Readings History</CardTitle>
        <CardDescription>Recent sensor readings from the device.</CardDescription>
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
            <Bar dataKey="temperature" fill="var(--color-temperature)" radius={4} />
            <Bar dataKey="humidity" fill="var(--color-humidity)" radius={4} />
            <Bar dataKey="pressure" fill="var(--color-pressure)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
