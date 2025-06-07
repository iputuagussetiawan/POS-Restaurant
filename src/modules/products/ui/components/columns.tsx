'use client';

import { ColumnDef } from '@tanstack/react-table';
import {ProductGetMany } from '../../types';
import GenerateAvatar from '@/components/generate-avatar';
import { CornerDownRightIcon } from 'lucide-react';

export const columns: ColumnDef<ProductGetMany[number]>[] = [
	{
		accessorKey: 'name',
		header: 'Product Name',
		cell: ({ row }) => (
			<div className="flex flex-col gap-y-1">
				<div className="flex items-center gap-x-2">
					<GenerateAvatar
						variant="botttsNeutral"
						seed={row.original.name}
						className="size-6"
					/>
					<span className="font-semibold capitalize">{row.original.name}</span>
				</div>
				<div className="flex items-center gap-x-2">
					<CornerDownRightIcon className="size-3 text-muted-foreground" />
					<span className="max-w-[200px] truncate text-sm text-muted-foreground capitalize">
						{row.original.imageUrl}
					</span>
				</div>
			</div>
		),
	},

	{
		accessorKey: 'ImageUrl',
		header: 'Image Url',
		cell: ({ row }) => (
			<div>
				{row.original.imageUrl}
			</div>
		),
	},
];
