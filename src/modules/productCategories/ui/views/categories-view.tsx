'use client';

import { useState, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { PlusIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/error-state';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
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

export const CategoriesViewLoading = () => (
	<div className="flex flex-col gap-y-4">
		<Skeleton className="h-4 w-36" />
		<div className="overflow-hidden rounded-lg border bg-white">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/40 hover:bg-muted/40">
						<TableHead className="px-4 py-3">
							<Skeleton className="h-4 w-32" />
						</TableHead>
						<TableHead className="px-4 py-3">
							<Skeleton className="h-4 w-40" />
						</TableHead>
						<TableHead className="px-4 py-3">
							<Skeleton className="h-4 w-24" />
						</TableHead>
						<TableHead className="px-4 py-3">
							<Skeleton className="h-4 w-20" />
						</TableHead>
						<TableHead className="px-4 py-3" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 8 }).map((_, i) => (
						<TableRow key={i}>
							<TableCell className="px-4 py-3">
								<div className="flex items-center gap-x-3">
									<Skeleton className="size-11 shrink-0 rounded-lg" />
									<Skeleton className="h-4 w-32" />
								</div>
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-4 w-64" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-4 w-24" />
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
		<div className="flex items-center justify-between">
			<Skeleton className="h-4 w-32" />
			<div className="flex gap-x-2">
				<Skeleton className="h-8 w-8 rounded-md" />
				<Skeleton className="h-8 w-8 rounded-md" />
				<Skeleton className="h-8 w-8 rounded-md" />
			</div>
		</div>
	</div>
);

export const CategoriesViewError = () => (
	<ErrorState title="Error loading categories" description="Please try again later." />
);
