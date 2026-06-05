'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { RowSelectionState } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { columns } from './columns';
import { discountsSelectColumn } from './discounts-select-column';
import { useDiscountsFilters } from '../../hooks/use-discounts-filter';
import DataPagination from '@/modules/products/ui/components/data-pagination';
import { DEFAULT_PAGE_SIZE } from '../../../../../constants';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { UseConfirm } from '@/hooks/use-confirm';
import EmptyState from '@/components/empty-state';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const DiscountsTable = () => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [filters, setFilters] = useDiscountsFilters();
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const isInactiveTab = filters.status === 'inactive';

	const { data } = useSuspenseQuery(trpc.discounts.getMany.queryOptions({ ...filters }));

	const bulkRemove = useMutation(
		trpc.discounts.bulkRemove.mutationOptions({
			onSuccess: async (res) => {
				await queryClient.invalidateQueries(trpc.discounts.getMany.queryOptions({}));
				setRowSelection({});
				toast.success(`${res.count} discount${res.count === 1 ? '' : 's'} deleted.`);
			},
			onError: (e) => toast.error(e.message),
		})
	);

	const [ConfirmBulkDialog, confirmBulk] = UseConfirm(
		'Delete selected discounts?',
		'This will permanently remove all selected inactive discounts.'
	);

	const selectedIds = useMemo(
		() =>
			Object.keys(rowSelection)
				.filter((k) => rowSelection[k])
				.map((idx) => data.items[Number(idx)]?.id)
				.filter(Boolean) as string[],
		[rowSelection, data.items]
	);

	const handleBulkDelete = async () => {
		if (selectedIds.length === 0) return;
		const ok = await confirmBulk();
		if (!ok) return;
		bulkRemove.mutate({ ids: selectedIds });
	};

	const activeColumns = isInactiveTab ? [discountsSelectColumn, ...columns] : columns;

	return (
		<div className="flex flex-col gap-y-4 px-4 py-4 pb-24 md:px-8">
			<ConfirmBulkDialog />

			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-sm text-muted-foreground">
					{data.total === 0
						? 'No discounts found'
						: `${data.total} discount${data.total === 1 ? '' : 's'} found`}
				</p>
				<div className="flex items-center gap-x-2">
					{isInactiveTab && selectedIds.length > 0 && (
						<Button
							variant="destructive"
							size="sm"
							onClick={handleBulkDelete}
							disabled={bulkRemove.isPending}
							className="h-8 gap-x-1.5 px-3 text-xs"
						>
							<Trash2Icon className="size-3.5" />
							Delete {selectedIds.length} selected
						</Button>
					)}
					<span className="hidden text-sm text-muted-foreground sm:inline">
						Rows per page
					</span>
					<Select
						value={String(filters.pageSize ?? DEFAULT_PAGE_SIZE)}
						onValueChange={(v) => setFilters({ pageSize: Number(v), page: 1 })}
					>
						<SelectTrigger size="sm" className="w-20 font-medium">
							<SelectValue />
						</SelectTrigger>
						<SelectContent align="end">
							{PAGE_SIZE_OPTIONS.map((s) => (
								<SelectItem key={s} value={String(s)}>
									{s}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{data.items.length === 0 ? (
				<EmptyState
					title="No discounts found"
					description="Try adjusting your search or create a new discount code."
				/>
			) : (
				<>
					<DataTable
						data={data.items}
						columns={activeColumns}
						rowSelection={isInactiveTab ? rowSelection : undefined}
						onRowSelectionChange={isInactiveTab ? setRowSelection : undefined}
					/>
					<DataPagination
						page={filters.page}
						total={data.total}
						totalPages={data.totalPages}
						pageSize={filters.pageSize ?? DEFAULT_PAGE_SIZE}
						onPageChange={(page) => setFilters({ page })}
						onPageSizeChange={(pageSize) => setFilters({ pageSize, page: 1 })}
					/>
				</>
			)}
		</div>
	);
};
