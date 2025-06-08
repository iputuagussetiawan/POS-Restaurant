'use client';

import { ColumnDef } from '@tanstack/react-table';
import {ProductGetMany } from '../../types';
import { CornerDownRightIcon } from 'lucide-react';
import Image from 'next/image';

export const columns: ColumnDef<ProductGetMany[number]>[] = [
	{
		accessorKey: 'name',
		header: 'Product Name',
		cell: ({ row }) => (
			<div className="flex flex-col gap-y-1">
				<div className="flex items-center gap-x-2">
					<Image
						src={row.original.imageUrl}
						alt={row.original.name}
						width={100}
						height={100}
						quality={100}

						className="rounded-full w-[42px] h-[42px] object-cover"
					/>
					<span className="font-semibold capitalize">{row.original.name}</span>
				</div>
				<div className="flex items-center gap-x-2">
					<CornerDownRightIcon className="size-3 text-muted-foreground" />
					<span className="max-w-[200px] truncate text-sm text-muted-foreground capitalize">
						{row.original.categoryId}
					</span>
				</div>
			</div>
		),
	},

	{
		accessorKey: 'Description',
		header: 'Description',
		cell: ({ row }) => (
			<div>
				{row.original.categoryId}
			</div>
		),
	},
];
