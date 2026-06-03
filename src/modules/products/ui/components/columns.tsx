'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ProductGetMany } from '../../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDownIcon, MoreHorizontalIcon, PencilIcon, TrashIcon, EyeIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { toast } from 'sonner';
import { UseConfirm } from '@/hooks/use-confirm';
import UpdateProductDialog from './update-product-dialog';
import { ProductGetOne } from '../../types';

const RowActions = ({ row }: { row: ProductGetMany[number] }) => {
	const router = useRouter();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [editOpen, setEditOpen] = useState(false);

	const remove = useMutation(
		trpc.products.remove.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.products.getMany.queryOptions({}));
				toast.success('Product deleted.');
			},
			onError: (e) => toast.error(e.message),
		})
	);

	const [ConfirmDialog, confirm] = UseConfirm(
		'Delete product?',
		`"${row.name}" will be permanently removed.`
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
			<UpdateProductDialog
				open={editOpen}
				onOpenChange={setEditOpen}
				initialValues={row as unknown as ProductGetOne}
			/>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
					<Button variant="ghost" size="icon" className="size-8">
						<MoreHorizontalIcon className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
					<DropdownMenuItem onClick={() => router.push(`/admin/products/${row.id}`)}>
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

export const columns: ColumnDef<ProductGetMany[number]>[] = [
	{
		accessorKey: 'name',
		header: ({ column }) => (
			<Button
				variant="ghost"
				size="sm"
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				className="-ml-3 h-8"
			>
				Product
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
				<div className="flex min-w-0 flex-col">
					<span className="truncate font-medium">{row.original.name}</span>
					{row.original.description ? (
						<span className="max-w-[220px] truncate text-xs text-muted-foreground">
							{row.original.description}
						</span>
					) : (
						<span className="text-xs text-muted-foreground/50">No description</span>
					)}
				</div>
			</div>
		),
	},
	{
		accessorKey: 'categories',
		header: 'Category',
		cell: ({ row }) =>
			row.original.categories?.name ? (
				<Badge variant="outline" className="font-normal capitalize">
					{row.original.categories.name}
				</Badge>
			) : (
				<span className="text-muted-foreground">—</span>
			),
	},
	{
		accessorKey: 'price',
		header: ({ column }) => (
			<Button
				variant="ghost"
				size="sm"
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				className="-ml-3 h-8"
			>
				Price
				<ArrowUpDownIcon className="ml-2 size-3.5" />
			</Button>
		),
		cell: ({ row }) => (
			<span className="font-semibold tabular-nums">
				${Number(row.original.price).toFixed(2)}
			</span>
		),
	},
	{
		accessorKey: 'isAvailable',
		header: 'Status',
		cell: ({ row }) =>
			row.original.isAvailable ? (
				<Badge className="border-green-200 bg-green-50 text-green-700 hover:bg-green-50">
					● Available
				</Badge>
			) : (
				<Badge variant="outline" className="text-muted-foreground">
					● Unavailable
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
