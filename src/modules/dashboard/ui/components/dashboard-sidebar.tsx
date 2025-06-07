'use client';
import { Separator } from '@/components/ui/separator';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { BotIcon, Star, StarIcon, VideoIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
//import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from '@/components/ui/sidebar'
import React from 'react';
import DashboardUserButton from './dashboard-user-button';

const firstSection = [
    {
        icon: VideoIcon,
        label: 'Meetings',
        href: '/meetings',
    },
    {
        icon: BotIcon,
        label: 'Agents',
        href: '/agents',
    },
];

const secondSection = [
    {
        icon: StarIcon,
        label: 'Upgrade',
        href: '/upgrade',
    },
];
const DashboardSidebar = () => {
    const pathname = usePathname();
    //const pathname="/agents";
    return (
        <Sidebar>
            <SidebarHeader className="text-sidebar-accent-foreground">
                <Link href="/" className="flex items-center gap-2 px-2 pt-2">
                    <Image src="/logo.svg" alt="Meet.AI" width={36} height={36} />
                    <p className="text-2xl font-semibold">Meet.AI</p>
                </Link>
            </SidebarHeader>
            <div className="px-4 py-2">
                <Separator className="text-[#5d6b68] opacity-10" />
            </div>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {firstSection.map((item, index) => (
                                <SidebarMenuItem key={index}>
                                    <SidebarMenuButton
                                        asChild
                                        className={cn(
                                            'h-10 border border-transparent from-sidebar-accent from-5% via-sidebar/50 via-30% to-sidebar/50 hover:border-[#5D6B69]/10 hover:bg-linear-to-r/oklch',
                                            pathname === item.href &&
                                                'border-[#5D6B68]/10 bg-linear-to-r/oklch'
                                        )}
                                        isActive={pathname === item.href}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="mr-2 size-5" />
                                            <span className="text-sm font-medium tracking-tight">
                                                {item.label}
                                            </span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <div className="px-4 py-2">
                    <Separator className="text-[#5d6b68] opacity-10" />
                </div>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {secondSection.map((item, index) => (
                                <SidebarMenuItem key={index}>
                                    <SidebarMenuButton
                                        asChild
                                        className={cn(
                                            'h-10 border border-transparent from-sidebar-accent from-5% via-sidebar/50 via-30% to-sidebar/50 hover:border-[#5D6B69]/10 hover:bg-linear-to-r/oklch',
                                            pathname === item.href &&
                                                'border-[#5D6B68]/10 bg-linear-to-r/oklch'
                                        )}
                                        isActive={pathname === item.href}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="mr-2 size-5" />
                                            <span className="text-sm font-medium tracking-tight">
                                                {item.label}
                                            </span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="text-white">
                <DashboardUserButton />
            </SidebarFooter>
        </Sidebar>
    );
};

export default DashboardSidebar;
