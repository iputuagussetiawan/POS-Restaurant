import GenerateAvatar from '@/components/generate-avatar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerDescription,
} from '@/components/ui/drawer';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { authClient } from '@/lib/auth-client';
import {
	ChevronDownIcon,
	CrownIcon,
	LayoutDashboardIcon,
	LogOutIcon,
	ShieldIcon,
	ShoppingCartIcon,
	UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; badge: string }> = {
	admin: { label: 'Admin', icon: CrownIcon, badge: 'border-red-200 bg-red-50 text-red-700' },
	manager: {
		label: 'Manager',
		icon: ShieldIcon,
		badge: 'border-blue-200 bg-blue-50 text-blue-700',
	},
	cashier: {
		label: 'Cashier',
		icon: ShoppingCartIcon,
		badge: 'border-green-200 bg-green-50 text-green-700',
	},
	member: {
		label: 'Member',
		icon: UserIcon,
		badge: 'border-purple-200 bg-purple-50 text-purple-700',
	},
	pending: {
		label: 'Pending',
		icon: UserIcon,
		badge: 'border-yellow-200 bg-yellow-50 text-yellow-700',
	},
};

const UserAvatar = ({
	name,
	image,
	className = 'size-9',
}: {
	name: string;
	image?: string | null;
	className?: string;
}) =>
	image ? (
		<Avatar className={className}>
			<AvatarImage src={image} />
			<AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
		</Avatar>
	) : (
		<GenerateAvatar seed={name} variant="initials" className={className} />
	);

const DashboardUserButton = () => {
	const isMobile = useIsMobile();
	const router = useRouter();
	const { data, isPending } = authClient.useSession();

	if (isPending || !data?.user) return null;

	const { name, email, image } = data.user;
	const role = ((data.user as { role?: string }).role ?? 'pending') as string;
	const roleConfig = ROLE_CONFIG[role] ?? ROLE_CONFIG.pending;
	const RoleIcon = roleConfig.icon;

	const onLogout = () => {
		authClient.signOut({ fetchOptions: { onSuccess: () => router.push('/sign-in') } });
	};

	if (isMobile) {
		return (
			<Drawer>
				<button className="flex w-full items-center gap-x-3 overflow-hidden rounded-lg border border-border/10 bg-white/5 p-3 hover:bg-white/10">
					<UserAvatar name={name} image={image} />
					<div className="flex min-w-0 flex-1 flex-col text-left">
						<span className="truncate text-sm font-medium text-white">{name}</span>
						<span className="truncate text-xs text-white/60">{email}</span>
					</div>
					<ChevronDownIcon className="size-4 shrink-0 text-white/60" />
				</button>
				<DrawerContent>
					<DrawerHeader className="flex flex-row items-center gap-x-3 pb-2">
						<UserAvatar name={name} image={image} className="size-11" />
						<div>
							<DrawerTitle className="text-left">{name}</DrawerTitle>
							<DrawerDescription className="text-left">{email}</DrawerDescription>
							<Badge
								variant="outline"
								className={`mt-1 gap-x-1 px-1.5 py-0 text-[10px] ${roleConfig.badge}`}
							>
								<RoleIcon className="size-2.5" />
								{roleConfig.label}
							</Badge>
						</div>
					</DrawerHeader>
					<DrawerFooter className="gap-y-2">
						<Button variant="outline" className="justify-start gap-x-2" asChild>
							<Link href="/user/profile">
								<UserIcon className="size-4" /> Profile
							</Link>
						</Button>
						<Button
							variant="outline"
							className="justify-start gap-x-2 text-destructive hover:text-destructive"
							onClick={onLogout}
						>
							<LogOutIcon className="size-4" /> Sign out
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="flex w-full items-center gap-x-3 overflow-hidden rounded-lg border border-border/10 bg-white/5 p-3 hover:bg-white/10 focus:outline-none">
				<UserAvatar name={name} image={image} />
				<div className="flex min-w-0 flex-1 flex-col text-left">
					<span className="truncate text-sm font-medium text-white">{name}</span>
					<span className="truncate text-xs text-white/60">{email}</span>
				</div>
				<ChevronDownIcon className="size-4 shrink-0 text-white/60" />
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" side="right" className="w-72">
				<DropdownMenuLabel className="p-0">
					<div className="flex items-center gap-x-3 px-3 py-3">
						<UserAvatar name={name} image={image} className="size-10 shrink-0" />
						<div className="flex min-w-0 flex-col">
							<span className="truncate text-sm font-semibold">{name}</span>
							<span className="truncate text-xs text-muted-foreground">{email}</span>
							<Badge
								variant="outline"
								className={`mt-1.5 w-fit gap-x-1 px-1.5 py-0 text-[10px] ${roleConfig.badge}`}
							>
								<RoleIcon className="size-2.5" />
								{roleConfig.label}
							</Badge>
						</div>
					</div>
				</DropdownMenuLabel>

				<DropdownMenuSeparator />

				<DropdownMenuItem asChild className="cursor-pointer gap-x-2">
					<Link href="/">
						<LayoutDashboardIcon className="size-4 text-muted-foreground" /> Dashboard
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild className="cursor-pointer gap-x-2">
					<Link href="/user/profile">
						<UserIcon className="size-4 text-muted-foreground" /> Profile
					</Link>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<DropdownMenuItem
					onClick={onLogout}
					className="cursor-pointer gap-x-2 text-destructive focus:text-destructive"
				>
					<LogOutIcon className="size-4" /> Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default DashboardUserButton;
