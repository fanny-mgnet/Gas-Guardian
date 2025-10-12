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


  const percentage = Math.min(Math.round((gasLevel / MAX_GAS_LEVEL) * 100), 100);
  
  let status: 'Safe' | 'Warning' | 'Danger' = 'Safe';
  let colorClass = 'text-green-500';
  let ringColorClass = 'ring-green-500';
  let progressColorClass = 'stroke-green-500';

  if (percentage > 75) {
    status = 'Danger';
    colorClass = 'text-destructive';
    ringColorClass = 'ring-destructive';
    progressColorClass = 'stroke-destructive';
  } else if (percentage > 40) {
    status = 'Warning';
    colorClass = 'text-accent';
    ringColorClass = 'ring-accent';
    progressColorClass = 'stroke-accent';
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
              cx="60"
              cy="60"
              r="52"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Progress Circle */}
            <circle
              className={cn('stroke-current transition-all duration-500', progressColorClass)}
              cx="60"
              cy="60"
              r="52"
              strokeWidth="10"
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
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Updated {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}</span>
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
