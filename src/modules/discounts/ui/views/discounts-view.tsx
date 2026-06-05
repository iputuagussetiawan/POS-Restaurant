'use client';

import { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorState from '@/components/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import NewDiscountDialog from '../components/new-discount-dialog';
import { DiscountsTable } from '../components/discounts-table';
import { PlusIcon } from 'lucide-react';

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
