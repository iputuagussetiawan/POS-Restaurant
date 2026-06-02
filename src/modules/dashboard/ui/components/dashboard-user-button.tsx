import GenerateAvatar from '@/components/generate-avatar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
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
import { ChevronDownIcon, LogOutIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

const UserInfo = ({
	name,
	email,
	image,
}: {
	name: string;
	email: string;
	image?: string | null;
}) => (
	<>
		{image ? (
			<Avatar>
				<AvatarImage src={image} />
				<AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
			</Avatar>
		) : (
			<GenerateAvatar seed={name} variant="initials" className="mr-3 size-9" />
		)}
		<div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden text-left">
			<p className="w-full truncate text-sm">{name}</p>
			<p className="w-full truncate text-xs">{email}</p>
		</div>
		<ChevronDownIcon className="size-4 shrink-0" />
	</>
);

const DashboardUserButton = () => {
	const isMobile = useIsMobile();
	const router = useRouter();
	const { data, isPending } = authClient.useSession();

	if (isPending || !data?.user) return null;

	const onLogout = () => {
		authClient.signOut({
			fetchOptions: { onSuccess: () => router.push('/sign-in') },
		});
	};

	if (isMobile) {
		return (
			<Drawer>
				<DrawerTrigger className="flex w-full items-center justify-between gap-x-2 overflow-hidden rounded-lg border border-border/10 bg-white/5 p-3 hover:bg-white/10">
					<UserInfo
						name={data.user.name}
						email={data.user.email}
						image={data.user.image}
					/>
				</DrawerTrigger>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>{data.user.name}</DrawerTitle>
						<DrawerDescription>{data.user.email}</DrawerDescription>
					</DrawerHeader>
					<DrawerFooter>
						<Button variant="outline" asChild>
							<Link href="/profile">
								<UserIcon className="size-4 text-black" />
								<span>Profile</span>
							</Link>
						</Button>
						<Button variant="outline" onClick={onLogout}>
							<LogOutIcon className="size-4 text-black" />
							<span>Logout</span>
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="flex w-full items-center justify-between gap-x-2 overflow-hidden rounded-lg border border-border/10 bg-white/5 p-3 hover:bg-white/10">
				<UserInfo name={data.user.name} email={data.user.email} image={data.user.image} />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" side="right" className="w-72">
				<DropdownMenuLabel>
					<div className="flex flex-col gap-1">
						<span className="truncate font-medium">{data.user.name}</span>
						<span className="truncate text-sm font-normal text-muted-foreground">
							{data.user.email}
						</span>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					asChild
					className="flex cursor-pointer items-center justify-between"
				>
					<Link href="/profile">
						Profile
						<UserIcon className="size-4" />
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={onLogout}
					className="flex cursor-pointer items-center justify-between"
				>
					Logout
					<LogOutIcon className="size-4" />
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default DashboardUserButton;
