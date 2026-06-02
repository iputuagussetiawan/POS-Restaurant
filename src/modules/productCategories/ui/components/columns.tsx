'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CategoriesGetMany } from '../../types';
import { Button } from '@/components/ui/button';
import { ArrowUpDownIcon } from 'lucide-react';
import Image from 'next/image';

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
				Category Name
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
		accessorKey: 'description',
		header: 'Description',
		cell: ({ row }) => (
			<span className="max-w-[360px] truncate text-sm text-muted-foreground">
				{row.original.description}
			</span>
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
