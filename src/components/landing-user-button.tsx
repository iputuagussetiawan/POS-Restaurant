'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import GenerateAvatar from '@/components/generate-avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
	LayoutDashboardIcon,
	LogOutIcon,
	UserIcon,
	ShoppingCartIcon,
	ChevronDownIcon,
	CrownIcon,
	ShieldIcon,
	UtensilsCrossedIcon,
} from 'lucide-react';

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
	kitchen: {
		label: 'Kitchen',
		icon: UtensilsCrossedIcon,
		badge: 'border-orange-200 bg-orange-50 text-orange-700',
	},
	pending: {
		label: 'Pending',
		icon: UserIcon,
		badge: 'border-yellow-200 bg-yellow-50 text-yellow-700',
	},
};

interface Props {
	user: {
		name: string;
		email: string;
		image?: string | null;
		role?: string | null;
	};
}

const LandingUserButton = ({ user }: Props) => {
	const router = useRouter();
	const role = (user.role ?? 'pending') as string;
	const roleConfig = ROLE_CONFIG[role] ?? ROLE_CONFIG.pending;
	const RoleIcon = roleConfig.icon;

	const onLogout = () => {
		authClient.signOut({
			fetchOptions: { onSuccess: () => router.push('/') },
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="flex items-center gap-x-2 rounded-full border bg-white px-2 py-1.5 text-sm shadow-sm transition-colors hover:bg-muted/50 focus:outline-none">
					{user.image ? (
						<Avatar className="size-7">
							<AvatarImage src={user.image} />
							<AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
						</Avatar>
					) : (
						<GenerateAvatar seed={user.name} variant="initials" className="size-7" />
					)}
					<span className="hidden max-w-[120px] truncate font-medium sm:block">
						{user.name}
					</span>
					<ChevronDownIcon className="size-3.5 text-muted-foreground" />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-64">
				{/* user info */}
				<DropdownMenuLabel className="p-0">
					<div className="flex items-center gap-x-3 px-3 py-3">
						{user.image ? (
							<Avatar className="size-10 shrink-0">
								<AvatarImage src={user.image} />
								<AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
							</Avatar>
						) : (
							<GenerateAvatar
								seed={user.name}
								variant="initials"
								className="size-10 shrink-0"
							/>
						)}
						<div className="flex min-w-0 flex-col">
							<span className="truncate text-sm font-semibold">{user.name}</span>
							<span className="truncate text-xs text-muted-foreground">
								{user.email}
							</span>
							<Badge
								variant="outline"
								className={`mt-1 w-fit gap-x-1 px-1.5 py-0 text-[10px] ${roleConfig.badge}`}
							>
								<RoleIcon className="size-2.5" />
								{roleConfig.label}
							</Badge>
						</div>
					</div>
				</DropdownMenuLabel>

				<DropdownMenuSeparator />

				<DropdownMenuItem asChild>
					<Link href="/" className="flex cursor-pointer items-center gap-x-2">
						<LayoutDashboardIcon className="size-4 text-muted-foreground" />
						Dashboard
					</Link>
				</DropdownMenuItem>

				<DropdownMenuItem asChild>
					<Link href="/user/profile" className="flex cursor-pointer items-center gap-x-2">
						<UserIcon className="size-4 text-muted-foreground" />
						Profile
					</Link>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<DropdownMenuItem
					onClick={onLogout}
					className="flex cursor-pointer items-center gap-x-2 text-destructive focus:text-destructive"
				>
					<LogOutIcon className="size-4" />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default LandingUserButton;
