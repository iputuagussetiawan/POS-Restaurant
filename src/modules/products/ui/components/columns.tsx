'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ProductGetMany } from '../../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDownIcon } from 'lucide-react';
import Image from 'next/image';

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
];
