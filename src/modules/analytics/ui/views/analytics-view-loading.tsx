import { Skeleton } from '@/components/ui/skeleton';

export const AnalyticsViewLoading = () => (
	<div className="flex flex-col gap-6 p-6">
		<div>
			<Skeleton className="h-6 w-32 rounded" />
			<Skeleton className="mt-1 h-4 w-48 rounded" />
		</div>
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			{Array.from({ length: 4 }).map((_, i) => (
				<div key={i} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
					<div className="flex justify-between">
						<Skeleton className="h-3 w-24 rounded" />
						<Skeleton className="h-9 w-9 rounded-xl" />
					</div>
					<Skeleton className="h-7 w-28 rounded" />
					<Skeleton className="h-3 w-36 rounded" />
				</div>
			))}
		</div>
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
			<div className="col-span-2 rounded-2xl bg-white p-5 shadow-sm">
				<Skeleton className="mb-4 h-4 w-40 rounded" />
				<Skeleton className="h-[220px] w-full rounded-xl" />
			</div>
			<div className="rounded-2xl bg-white p-5 shadow-sm">
				<Skeleton className="mb-4 h-4 w-32 rounded" />
				<Skeleton className="mx-auto h-40 w-40 rounded-full" />
				<div className="mt-4 space-y-2">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-3 w-full rounded" />
					))}
				</div>
			</div>
		</div>
	</div>
);
