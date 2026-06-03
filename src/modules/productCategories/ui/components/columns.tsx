'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CategoriesGetMany } from '../../types';
import { CategoriesGetOne } from '../../types';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDownIcon, EyeIcon, MoreHorizontalIcon, PencilIcon, TrashIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { toast } from 'sonner';
import { UseConfirm } from '@/hooks/use-confirm';
import UpdateCategoriesDialog from './update-categories-dialog';

const RowActions = ({ row }: { row: CategoriesGetMany[number] }) => {
	const router = useRouter();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [editOpen, setEditOpen] = useState(false);

	const remove = useMutation(
		trpc.categories.remove.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.categories.getMany.queryOptions({}));
				toast.success('Category deleted.');
			},
			onError: (e) => toast.error(e.message),
		})
	);

	const [ConfirmDialog, confirm] = UseConfirm(
		'Delete category?',
		`"${row.name}" and all its products will be permanently removed.`
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
			<UpdateCategoriesDialog
				open={editOpen}
				onOpenChange={setEditOpen}
				initialValues={row as unknown as CategoriesGetOne}
			/>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
					<Button variant="ghost" size="icon" className="size-8">
						<MoreHorizontalIcon className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
					<DropdownMenuItem onClick={() => router.push(`/admin/categories/${row.id}`)}>
						<EyeIcon className="mr-2 size-4" /> View details
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setEditOpen(true)}>
						<PencilIcon className="mr-2 size-4" /> Edit
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

export const columns: ColumnDef<CategoriesGetMany[number]>[] = [
	{
		accessorKey: 'name',
		header: ({ column }) => (
			<Button
				variant="ghost"
				size="sm"
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				className="-ml-3 h-8"
			>
				Category
				<ArrowUpDownIcon className="ml-2 size-3.5" />
			</Button>
		),
		cell: ({ row }) => (
			<div className="flex items-center gap-x-3">
				<div className="relative size-11 shrink-0 overflow-hidden rounded-lg border bg-muted shadow-sm">
					<Image
						src={row.original.imageUrl}
						alt={row.original.name}
						fill
						sizes="44px"
						className="object-cover"
					/>
				</div>
				<span className="font-medium capitalize">{row.original.name}</span>
			</div>
		),
	},
	{
		accessorKey: 'description',
		header: 'Description',
		cell: ({ row }) => (
			<span className="max-w-[400px] truncate text-sm text-muted-foreground">
				{row.original.description || (
					<span className="text-muted-foreground/50">No description</span>
				)}
			</span>
		),
	},
	{
		accessorKey: 'slug',
		header: 'Slug',
		cell: ({ row }) => (
			<span className="font-mono text-xs text-muted-foreground">{row.original.slug}</span>
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
				Created
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
