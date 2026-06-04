'use client';

import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Suspense, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorState from '@/components/error-state';
import EmptyState from '@/components/empty-state';
import { DataTable } from '@/components/data-table';
import { columns } from '../components/columns';
import { useDiscountsFilters } from '../../hooks/use-discounts-filter';
import DataPagination from '@/modules/products/ui/components/data-pagination';
import { DEFAULT_PAGE_SIZE } from '../../../../../constants';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import NewDiscountDialog from '../components/new-discount-dialog';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { DiscountsGetMany } from '../../types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UseConfirm } from '@/hooks/use-confirm';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const selectColumn: ColumnDef<DiscountsGetMany[number]> = {
	id: 'select',
	header: ({ table }) => (
		<Checkbox
			checked={
				table.getIsAllPageRowsSelected() ||
				(table.getIsSomePageRowsSelected() && 'indeterminate')
			}
			onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
			aria-label="Select all"
		/>
	),
	cell: ({ row }) => (
		<Checkbox
			checked={row.getIsSelected()}
			onCheckedChange={(v) => row.toggleSelected(!!v)}
			onClick={(e) => e.stopPropagation()}
			aria-label="Select row"
		/>
	),
	meta: { className: 'w-10' },
};

const DiscountsTable = () => {
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

	const activeColumns = isInactiveTab ? [selectColumn, ...columns] : columns;

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

export const DiscountsViewLoading = () => (
	<div className="flex flex-col gap-y-4 px-4 py-4 md:px-8">
		<Skeleton className="h-4 w-36" />
		<div className="overflow-hidden rounded-lg border bg-white">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/40 hover:bg-muted/40">
						{['Code', 'Name', 'Discount', 'Status', 'Uses', 'Expires', ''].map((h) => (
							<TableHead key={h} className="px-4 py-3">
								<Skeleton className="h-4 w-16" />
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 8 }).map((_, i) => (
						<TableRow key={i}>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-4 w-32" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-4 w-16" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-5 w-16 rounded-full" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-4 w-12" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-4 w-20" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="size-8 rounded-md" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	</div>
);

const DiscountsViewError = () => (
	<ErrorState title="Error loading discounts" description="Please try again later." />
);

export const DiscountsView = () => {
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<>
			<NewDiscountDialog open={dialogOpen} onOpenChange={setDialogOpen} />
			<ErrorBoundary fallback={<DiscountsViewError />}>
				<Suspense fallback={<DiscountsViewLoading />}>
					<DiscountsTable />
				</Suspense>
			</ErrorBoundary>

			{/* FAB */}
			<div
				style={{
					position: 'fixed',
					bottom: '2rem',
					left: '50%',
					transform: 'translateX(-50%)',
					zIndex: 40,
				}}
			>
				<button
					onClick={() => setDialogOpen(true)}
					className="rgb-glow relative flex w-fit items-center gap-x-2.5 rounded-full py-3 pr-5 pl-3 text-sm font-semibold text-white shadow-[0_8px_40px_rgba(14,165,233,0.35),0_4px_16px_rgba(124,58,237,0.25)]"
				>
					<span className="flex size-7 items-center justify-center rounded-full bg-white/20">
						<PlusIcon className="size-4" />
					</span>
					Add Discount
				</button>
			</div>
		</>
	);
};
