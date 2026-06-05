import { Skeleton } from '@/components/ui/skeleton';

export const HistoryViewLoading = () => (
	<div className="flex flex-1 flex-col">
		<div className="border-b bg-white px-6 py-5">
			<div className="flex items-center gap-3">
				<Skeleton className="h-10 w-10 rounded-xl" />
				<div className="space-y-1.5">
					<Skeleton className="h-4 w-32 rounded" />
					<Skeleton className="h-3 w-56 rounded" />
				</div>
			</div>
		</div>
		<div className="flex flex-1 flex-col gap-6 bg-muted/40 p-6">
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className="h-24 rounded-2xl" />
				))}
			</div>
			<Skeleton className="h-16 rounded-2xl" />
			<Skeleton className="h-96 rounded-2xl" />
		</div>
	</div>
);
