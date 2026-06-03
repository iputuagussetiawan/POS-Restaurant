'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authClient } from '@/lib/auth-client';
import { ChevronDownIcon, LogOutIcon, UserIcon } from 'lucide-react';
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
	const email = session?.user?.email ?? '';
	const image = session?.user?.image ?? '';
	const initials = name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors outline-none hover:bg-gray-100">
					<Avatar className="h-7 w-7">
						{image && <AvatarImage src={image} />}
						<AvatarFallback className="bg-green-700 text-xs font-semibold text-white">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col items-start leading-tight">
						<span className="text-xs font-semibold text-gray-800">{name}</span>
						{email && (
							<span className="max-w-[120px] truncate text-[10px] text-gray-400">
								{email}
							</span>
						)}
					</div>
					<ChevronDownIcon className="ml-1 h-3.5 w-3.5 text-gray-400" />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-56 p-1.5">
				{/* User info header */}
				<div className="mb-1 flex items-center gap-3 rounded-md bg-gray-50 px-3 py-2.5">
					<Avatar className="h-9 w-9">
						{image && <AvatarImage src={image} />}
						<AvatarFallback className="bg-green-700 text-sm font-bold text-white">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div className="flex min-w-0 flex-col">
						<span className="truncate text-xs font-semibold text-gray-800">{name}</span>
						{email && (
							<span className="truncate text-[10px] text-gray-400">{email}</span>
						)}
					</div>
				</div>

				<DropdownMenuSeparator className="my-1" />

				<DropdownMenuItem
					asChild
					className="cursor-pointer rounded-md px-3 py-2 text-sm text-gray-700"
				>
					<Link href="/user/profile" className="flex items-center gap-2.5">
						<UserIcon className="h-4 w-4 text-gray-400" />
						My Profile
					</Link>
				</DropdownMenuItem>

				<DropdownMenuSeparator className="my-1" />

				<DropdownMenuItem
					onClick={handleLogout}
					className="cursor-pointer rounded-md px-3 py-2 text-sm text-red-500 focus:bg-red-50 focus:text-red-600"
				>
					<LogOutIcon className="mr-2.5 h-4 w-4" />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default MenuProfile;
