'use client';

import { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorState from '@/components/error-state';
import { DiscountsViewLoading } from './discounts-view-loading';
import NewDiscountDialog from '../components/new-discount-dialog';
import { DiscountsTable } from '../components/discounts-table';
import { PlusIcon } from 'lucide-react';

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
