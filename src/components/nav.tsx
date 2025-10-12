'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { LayoutDashboard, HardHat, BarChart2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Nav() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <Link href="/dashboard" legacyBehavior passHref>
            <SidebarMenuButton
              isActive={pathname === '/dashboard'}
              tooltip="Dashboard"
            >
              <LayoutDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Link href="/dashboard/devices" legacyBehavior passHref>
            <SidebarMenuButton
              isActive={pathname.startsWith('/dashboard/devices')}
              tooltip="Devices"
            >
              <HardHat />
              <span>Devices</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Link href="/dashboard/statistics" legacyBehavior passHref>
            <SidebarMenuButton
              isActive={pathname.startsWith('/dashboard/statistics')}
              tooltip="Statistics"
            >
              <BarChart2 />
              <span>Statistics</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
