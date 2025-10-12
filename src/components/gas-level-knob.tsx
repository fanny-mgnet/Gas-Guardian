'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface GasLevelKnobProps {
  gasLevel: number;
  lastUpdated?: string;
}

const MAX_GAS_LEVEL = 400; // A reasonable max for percentage calculation

export function GasLevelKnob({ gasLevel, lastUpdated }: GasLevelKnobProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ensure gasLevel is a number, default to 0 if not
  const numericGasLevel = typeof gasLevel === 'number' ? gasLevel : 0;
  const percentage = Math.min(Math.round((numericGasLevel / MAX_GAS_LEVEL) * 100), 100);
  
  let status: 'Safe' | 'Warning' | 'Danger' = 'Safe';
  let colorClass = 'text-green-500';
  let progressColorClass = 'stroke-green-500';

  if (percentage > 75) {
    status = 'Danger';
    colorClass = 'text-destructive';
    progressColorClass = 'stroke-destructive';
  } else if (percentage > 40) {
    status = 'Warning';
    colorClass = 'text-yellow-500';
    progressColorClass = 'stroke-yellow-500';
  }

  const circumference = 2 * Math.PI * 52; // 2 * pi * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card>
      <CardHeader className="items-center pb-2">
        <CardTitle>Gas Level</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="relative h-40 w-40">
          <svg className="h-full w-full" viewBox="0 0 120 120">
            {/* Background Circle */}
            <circle
              className="stroke-current text-gray-200 dark:text-gray-700"
              stroke-opacity="0.5"
              cx="60"
              cy="60"
              r="52"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress Circle */}
            <circle
              className={cn('transition-all duration-500', progressColorClass)}
              cx="60"
              cy="60"
              r="52"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('text-4xl font-bold', colorClass)}>{percentage}%</span>
            <span className={cn('text-sm font-medium', colorClass)}>{status}</span>
          </div>
        </div>
        {lastUpdated && isClient && (
          <Badge variant="secondary" className="flex items-center gap-1.5 font-normal">
            <Clock className="h-3 w-3" />
            <span>Updated {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}</span>
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
