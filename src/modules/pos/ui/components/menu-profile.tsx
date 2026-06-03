'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authClient } from '@/lib/auth-client';
import { ChevronDown, LogOutIcon, User2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

const MenuProfile = () => {
	const { data: session } = authClient.useSession();
	const router = useRouter();

	const handleLogout = async () => {
		await authClient.signOut();
		router.push('/sign-in');
	};

	const name = session?.user?.name ?? 'Guest';
	const image = session?.user?.image ?? '';
	const initials = name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="flex items-center gap-2 outline-none">
				<Avatar>
					{image && <AvatarImage src={image} />}
					<AvatarFallback>{initials}</AvatarFallback>
				</Avatar>
				<span className="ml-1 text-sm text-gray-700 capitalize">{name}</span>
				<ChevronDown className="h-4 w-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[180px] shadow">
				<DropdownMenuLabel className="py-2 text-center">My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild className="py-2">
					<Link href="/user/profile">
						<User2 className="mr-2 h-4 w-4" />
						Profile
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2">
					<LogOutIcon className="mr-2 h-4 w-4" />
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default MenuProfile;
