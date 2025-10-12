'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi } from 'lucide-react';

export function DashboardHeader() {
  const [time, setTime] = useState('');
  const [greeting, setGreeting] = useState('Good day');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hours = now.getHours();

      if (hours < 12) {
        setGreeting('Good Morning');
      } else if (hours < 18) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }

      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };

    update();
    const timer = setInterval(update, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-bold">{greeting}</h1>
        <p className="text-muted-foreground">{time}</p>
      </div>
      <div className="flex items-center gap-4">
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800"
        >
          <div className="h-2 w-2 mr-2 rounded-full bg-green-500"></div>
          Connected
        </Badge>
        <Wifi className="text-muted-foreground" />
      </div>
    </div>
  );
}
