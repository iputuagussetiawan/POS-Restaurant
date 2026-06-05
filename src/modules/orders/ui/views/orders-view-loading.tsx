import { Skeleton } from '@/components/ui/skeleton';

export const OrdersViewLoading = () => (
	<div className="flex flex-col gap-4 p-6">
		<Skeleton className="h-4 w-24 rounded" />
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{Array.from({ length: 8 }).map((_, i) => (
				<div
					key={i}
					className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]"
				>
					<Skeleton className="h-1.5 w-full rounded-none" />
					<div className="flex flex-col gap-3 p-4">
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-2.5">
								<Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
								<div className="space-y-1.5">
									<Skeleton className="h-4 w-28 rounded" />
									<Skeleton className="h-3 w-24 rounded" />
								</div>
							</div>
							<Skeleton className="h-8 w-8 rounded-lg" />
						</div>
						<div className="space-y-2 rounded-xl bg-gray-50 px-4 py-3">
							<Skeleton className="h-2.5 w-10 rounded" />
							<Skeleton className="h-7 w-32 rounded" />
							<Skeleton className="h-3 w-40 rounded" />
						</div>
						<div className="flex gap-1.5">
							<Skeleton className="h-6 w-16 rounded-full" />
							<Skeleton className="h-6 w-16 rounded-full" />
							<Skeleton className="h-6 w-20 rounded-full" />
						</div>
						<div className="space-y-2 border-t border-gray-100 pt-3">
							<Skeleton className="h-3.5 w-full rounded" />
							<Skeleton className="h-3.5 w-3/4 rounded" />
						</div>
					</div>
				</div>
			))}
		</div>
	</div>
);
