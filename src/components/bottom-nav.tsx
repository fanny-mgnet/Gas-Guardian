'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from './nav';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'inline-flex flex-col items-center justify-center px-5 hover:bg-muted group',
            )}
          >
            <div className={cn(
                'absolute top-0 h-0.5 w-8 bg-primary rounded-b-full transition-all',
                item.isActive(pathname) ? 'opacity-100' : 'opacity-0'
            )}></div>
            <item.icon className={cn(
                "w-5 h-5 mb-1 transition-colors",
                item.isActive(pathname) ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )} 
            />
            <span className={cn(
                "text-xs transition-colors",
                item.isActive(pathname) ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
            )}>
                {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
