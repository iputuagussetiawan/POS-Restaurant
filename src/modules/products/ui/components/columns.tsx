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
				Product Name
				<ArrowUpDownIcon className="ml-2 size-3.5" />
			</Button>
		),
		cell: ({ row }) => (
			<div className="flex items-center gap-x-3">
				<div className="relative size-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
					<Image
						src={row.original.imageUrl}
						alt={row.original.name}
						fill
						sizes="40px"
						className="object-cover"
					/>
				</div>
				<span className="font-medium capitalize">{row.original.name}</span>
			</div>
		),
	},
	{
		accessorKey: 'categories',
		header: 'Category',
		cell: ({ row }) =>
			row.original.categories?.name ? (
				<Badge variant="secondary" className="capitalize">
					{row.original.categories.name}
				</Badge>
			) : (
				<span className="text-muted-foreground">—</span>
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
			<span className="text-sm text-muted-foreground">
				{new Date(row.original.createdAt).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric',
				})}
			</span>
		),
	},
];
