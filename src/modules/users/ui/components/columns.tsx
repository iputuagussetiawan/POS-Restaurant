'use client';

import { ColumnDef } from '@tanstack/react-table';
import { UserGetMany } from '../../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	ArrowUpDownIcon,
	CheckIcon,
	ChevronDownIcon,
	CrownIcon,
	MoreHorizontalIcon,
	ShieldBanIcon,
	ShieldCheckIcon,
	ShieldIcon,
	UserIcon,
	ClockIcon,
	UtensilsCrossedIcon,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { toast } from 'sonner';
import { UseConfirm } from '@/hooks/use-confirm';
import { cn } from '@/lib/utils';

type Role = 'admin' | 'manager' | 'cashier' | 'kitchen' | 'pending';
const ROLES: Role[] = ['admin', 'manager', 'cashier', 'kitchen', 'pending'];

const ROLE_CONFIG: Record<
	Role,
	{ label: string; icon: React.ElementType; badge: string; item: string }
> = {
	admin: {
		label: 'Admin',
		icon: CrownIcon,
		badge: 'border-red-200 bg-red-50 text-red-700',
		item: 'text-red-700',
	},
	manager: {
		label: 'Manager',
		icon: ShieldIcon,
		badge: 'border-blue-200 bg-blue-50 text-blue-700',
		item: 'text-blue-700',
	},
	cashier: {
		label: 'Cashier',
		icon: UserIcon,
		badge: 'border-green-200 bg-green-50 text-green-700',
		item: 'text-green-700',
	},
	kitchen: {
		label: 'Kitchen',
		icon: UtensilsCrossedIcon,
		badge: 'border-orange-200 bg-orange-50 text-orange-700',
		item: 'text-orange-700',
	},
	pending: {
		label: 'Pending',
		icon: ClockIcon,
		badge: 'border-yellow-200 bg-yellow-50 text-yellow-700',
		item: 'text-yellow-700',
	},
};

const RoleCell = ({ row }: { row: UserGetMany[number] }) => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const currentRole = (row.role ?? 'pending') as Role;
	const config = ROLE_CONFIG[currentRole];
	const Icon = config.icon;

	const setRole = useMutation(
		trpc.users.setRole.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: trpc.users.getAll.queryKey() });
				toast.success('Role updated.');
			},
			onError: (e) => toast.error(e.message),
		})
	);

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
				<button
					className={cn(
						'flex items-center gap-x-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80',
						config.badge
					)}
				>
					<Icon className="size-3" />
					{config.label}
					<ChevronDownIcon className="size-3 opacity-60" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-40"
				onClick={(e) => e.stopPropagation()}
			>
				<DropdownMenuLabel className="text-xs text-muted-foreground">
					Change role
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{ROLES.map((r) => {
					const rc = ROLE_CONFIG[r];
					const RIcon = rc.icon;
					return (
						<DropdownMenuItem
							key={r}
							onClick={() => {
								if (r !== currentRole) setRole.mutate({ userId: row.id, role: r });
							}}
							className="flex items-center gap-x-2"
						>
							<RIcon className={cn('size-3.5', rc.item)} />
							<span className={cn('flex-1', rc.item)}>{rc.label}</span>
							{r === currentRole && (
								<CheckIcon className="size-3.5 text-muted-foreground" />
							)}
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

const RowActions = ({ row }: { row: UserGetMany[number] }) => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const ban = useMutation(
		trpc.users.ban.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: trpc.users.getAll.queryKey() });
				toast.success('User banned.');
			},
			onError: (e) => toast.error(e.message),
		})
	);

	const unban = useMutation(
		trpc.users.unban.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: trpc.users.getAll.queryKey() });
				toast.success('User unbanned.');
			},
			onError: (e) => toast.error(e.message),
		})
	);

	const [BanDialog, confirmBan] = UseConfirm(
		'Ban user?',
		`"${row.name}" will lose access to the system.`
	);

	const handleBan = async (e: React.MouseEvent) => {
		e.stopPropagation();
		const ok = await confirmBan();
		if (!ok) return;
		ban.mutate({ userId: row.id });
	};

	return (
		<>
			<BanDialog />
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
					<Button variant="ghost" size="icon" className="size-8">
						<MoreHorizontalIcon className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
					{row.banned ? (
						<DropdownMenuItem onClick={() => unban.mutate({ userId: row.id })}>
							<ShieldCheckIcon className="mr-2 size-4 text-green-600" /> Unban user
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem
							onClick={handleBan}
							className="text-destructive focus:text-destructive"
						>
							<ShieldBanIcon className="mr-2 size-4" /> Ban user
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
};

export const columns: ColumnDef<UserGetMany[number]>[] = [
	{
		accessorKey: 'name',
		header: ({ column }) => (
			<Button
				variant="ghost"
				size="sm"
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				className="-ml-3 h-8"
			>
				Name
				<ArrowUpDownIcon className="ml-2 size-3.5" />
			</Button>
		),
		cell: ({ row }) => (
			<div className="flex flex-col">
				<span className="font-medium">{row.original.name}</span>
				<span className="text-xs text-muted-foreground">{row.original.email}</span>
			</div>
		),
	},
	{
		accessorKey: 'role',
		header: 'Role',
		cell: ({ row }) => <RoleCell row={row.original} />,
	},
	{
		accessorKey: 'banned',
		header: 'Status',
		cell: ({ row }) =>
			row.original.banned ? (
				<Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
					● Banned
				</Badge>
			) : (
				<Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
					● Active
				</Badge>
			),
	},
	{
		accessorKey: 'createdAt',
		header: ({ column }) => (
			<Button
				variant="ghost"
				size="sm"
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				className="-ml-3 h-8"
			>
				Joined
				<ArrowUpDownIcon className="ml-2 size-3.5" />
			</Button>
		),
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground tabular-nums">
				{new Date(row.original.createdAt).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric',
				})}
			</span>
		),
	},
	{
		id: 'actions',
		header: '',
		meta: { className: 'w-10' },
		cell: ({ row }) => (
			<div className="flex justify-end">
				<RowActions row={row.original} />
			</div>
		),
	},
];
