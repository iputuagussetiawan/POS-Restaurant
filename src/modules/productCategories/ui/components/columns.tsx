'use client';

import { ColumnDef } from '@tanstack/react-table';
import GenerateAvatar from '@/components/generate-avatar';
import { CornerDownRightIcon, VideoIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CategoriesGetMany } from '../../types';


export const columns: ColumnDef<CategoriesGetMany[number]>[] = [
	{
		accessorKey: 'name',
		header: 'Agent Name',
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
						{row.original.description}
					</span>
				</div>
			</div>
		),
	},

	{
		accessorKey: 'description',
		header: 'Description',
		cell: ({ row }) => (
			<div>
				{row.original.description}
			</div>
		),
	},
];
