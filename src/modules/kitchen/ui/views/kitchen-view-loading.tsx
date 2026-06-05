import { Skeleton } from '@/components/ui/skeleton';

export const KitchenViewLoading = () => (
	<div className="flex flex-1 flex-col bg-gray-950">
		<div className="border-b border-white/10 px-6 py-4">
			<div className="flex items-center gap-3">
				<Skeleton className="h-11 w-11 rounded-xl bg-white/10" />
				<div className="space-y-1.5">
					<Skeleton className="h-5 w-36 bg-white/10" />
					<Skeleton className="h-3 w-48 bg-white/10" />
				</div>
			</div>
			<div className="mt-5 flex gap-3">
				<Skeleton className="h-11 w-36 rounded-xl bg-white/10" />
				<Skeleton className="h-11 w-36 rounded-xl bg-white/10" />
			</div>
		</div>
		<div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{Array.from({ length: 8 }).map((_, i) => (
				<Skeleton key={i} className="h-72 rounded-2xl bg-white/5" />
			))}
		</div>
	</div>
);
