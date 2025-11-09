'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface GasLevelDisplayCardProps {
  gasPercentage: number;
  lastUpdated?: string;
}

export function GasLevelDisplayCard({ gasPercentage, lastUpdated }: GasLevelDisplayCardProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    console.log("GasLevelDisplayCard: Received gasPercentage:", gasPercentage);
    console.log("GasLevelDisplayCard: Received lastUpdated:", lastUpdated);
  }, [gasPercentage, lastUpdated]);

  // Ensure gasPercentage is a number and within 0-100 range
  const percentage = Math.min(Math.max(typeof gasPercentage === 'number' ? Math.round(gasPercentage) : 0, 0), 100);
  
  let status: 'Safe' | 'Warning' | 'Danger' = 'Safe';
  let colorClass = 'text-green-500';

  if (percentage > 75) {
    status = 'Danger';
    colorClass = 'text-destructive';
  } else if (percentage > 40) {
    status = 'Warning';
    colorClass = 'text-yellow-500';
  }

  return (
    <Card>
      <CardHeader className="items-center pb-2">
        <CardTitle>Gas Level</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center justify-center p-8">
            <span className={cn('text-6xl font-bold', colorClass)}>{percentage}%</span>
            <span className={cn('text-lg font-medium mt-2', colorClass)}>{status}</span>
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
