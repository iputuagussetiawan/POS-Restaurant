'use client';

import { useState, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { PlusIcon } from 'lucide-react';
import ErrorState from '@/components/error-state';
import { CategoriesViewLoading } from './categories-view-loading';
import NewAgentDialog from '../components/new-agent-dialog';
import { CategoriesTable } from '../components/categories-table';

export const CategoriesView = () => {
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<div className="relative flex flex-col gap-y-4 px-4 py-4 pb-24 md:px-8">
			<NewAgentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
			<ErrorBoundary fallback={<CategoriesViewError />}>
				<Suspense fallback={<CategoriesViewLoading />}>
					<CategoriesTable />
				</Suspense>
			</ErrorBoundary>

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
					Add Category
				</button>
			</div>
		</div>
	);
};

export const CategoriesViewError = () => (
	<ErrorState title="Error loading categories" description="Please try again later." />
);
