'use client';

import {
  LayoutDashboard,
  HardHat,
  BarChart2,
  User,
  Bell,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

export const navItems = [
    {
        href: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        isActive: (pathname: string) => pathname === '/dashboard',
    },
    {
        href: '/dashboard/devices',
        label: 'Devices',
        icon: HardHat,
        isActive: (pathname: string) => pathname.startsWith('/dashboard/devices'),
    },
    {
        href: '/dashboard/statistics',
        label: 'Statistics',
        icon: BarChart2,
        isActive: (pathname: string) => pathname.startsWith('/dashboard/statistics'),
    },
    {
        href: '/dashboard/notifications',
        label: 'Notifications',
        icon: Bell,
        isActive: (pathname: string) => pathname.startsWith('/dashboard/notifications'),
    },
    {
        href: '/dashboard/profile',
        label: 'Profile',
        icon: User,
        isActive: (pathname:string) => pathname.startsWith('/dashboard/profile'),
    },
];
