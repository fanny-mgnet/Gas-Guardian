'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { LayoutDashboard, HardHat, BarChart2, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

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
        href: '/dashboard/profile',
        label: 'Profile',
        icon: User,
        isActive: (pathname: string) => pathname.startsWith('/dashboard/profile'),
    },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map(item => (
            <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton
                        isActive={item.isActive(pathname)}
                        tooltip={item.label}
                    >
                        <item.icon />
                        <span>{item.label}</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
