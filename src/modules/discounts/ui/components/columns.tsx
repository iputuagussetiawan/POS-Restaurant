'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DiscountsGetMany, DiscountsGetOne } from '../../types';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
	ArrowUpDownIcon,
	MoreHorizontalIcon,
	PencilIcon,
	TrashIcon,
	ToggleLeftIcon,
	ToggleRightIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { toast } from 'sonner';
import { UseConfirm } from '@/hooks/use-confirm';
import UpdateDiscountDialog from './update-discount-dialog';
import { format } from 'date-fns';

const RowActions = ({ row }: { row: DiscountsGetMany[number] }) => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [editOpen, setEditOpen] = useState(false);

	const remove = useMutation(
		trpc.discounts.remove.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.discounts.getMany.queryOptions({}));
				toast.success('Discount deleted.');
			},
			onError: (e) => toast.error(e.message),
		})
	);

	const toggleActive = useMutation(
		trpc.discounts.toggleActive.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.discounts.getMany.queryOptions({}));
			},
			onError: (e) => toast.error(e.message),
		})
	);

	const [ConfirmDialog, confirm] = UseConfirm(
		'Delete discount?',
		`"${row.name}" (${row.code}) will be permanently removed.`
	);

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation();
		const ok = await confirm();
		if (!ok) return;
		remove.mutate({ id: row.id });
	};

	return (
		<>
			<ConfirmDialog />
			<UpdateDiscountDialog
				open={editOpen}
				onOpenChange={setEditOpen}
				initialValues={row as unknown as DiscountsGetOne}
			/>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
					<Button variant="ghost" size="icon" className="size-8">
						<MoreHorizontalIcon className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
					<DropdownMenuItem onClick={() => setEditOpen(true)}>
						<PencilIcon className="mr-2 size-4" /> Edit
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => toggleActive.mutate({ id: row.id, isActive: !row.isActive })}
					>
						{row.isActive ? (
							<>
								<ToggleLeftIcon className="mr-2 size-4" /> Deactivate
							</>
						) : (
							<>
								<ToggleRightIcon className="mr-2 size-4" /> Activate
							</>
						)}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={handleDelete}
						className="text-destructive focus:text-destructive"
					>
						<TrashIcon className="mr-2 size-4" /> Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
};

export const columns: ColumnDef<DiscountsGetMany[number]>[] = [
	{
		accessorKey: 'code',
		header: ({ column }) => (
			<Button
				variant="ghost"
				size="sm"
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				className="-ml-3 h-8"
			>
				Code
				<ArrowUpDownIcon className="ml-2 size-3.5" />
			</Button>
		),
		cell: ({ row }) => (
			<span className="font-mono text-sm font-semibold tracking-wider">
				{row.original.code}
			</span>
		),
	},
	{
		accessorKey: 'name',
		header: 'Name',
		cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
	},
	{
		accessorKey: 'type',
		header: 'Discount',
		cell: ({ row }) => {
			const { type, value } = row.original;
			return (
				<span className="text-sm font-semibold text-green-700">
					{type === 'percentage' ? `${Number(value)}%` : `$${Number(value).toFixed(2)}`}
				</span>
			);
		},
	},
	{
		accessorKey: 'isActive',
		header: 'Status',
		cell: ({ row }) => (
			<Badge variant={row.original.isActive ? 'default' : 'secondary'}>
				{row.original.isActive ? 'Active' : 'Inactive'}
			</Badge>
		),
	},
	{
		accessorKey: 'usedCount',
		header: 'Uses',
		cell: ({ row }) => {
			const { usedCount, maxUses } = row.original;
			return (
				<span className="text-sm text-muted-foreground tabular-nums">
					{usedCount}
					{maxUses != null ? ` / ${maxUses}` : ''}
				</span>
			);
		},
	},
	{
		accessorKey: 'expiresAt',
		header: 'Expires',
		cell: ({ row }) => {
			const { expiresAt } = row.original;
			if (!expiresAt) return <span className="text-xs text-muted-foreground">Never</span>;
			const expired = new Date(expiresAt) < new Date();
			return (
				<span
					className={`text-xs tabular-nums ${expired ? 'text-destructive' : 'text-muted-foreground'}`}
				>
					{format(new Date(expiresAt), 'dd MMM yyyy')}
					{expired && ' (expired)'}
				</span>
			);
		},
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
