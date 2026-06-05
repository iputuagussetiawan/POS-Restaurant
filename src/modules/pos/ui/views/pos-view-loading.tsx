import { Skeleton } from '@/components/ui/skeleton';

export const POSViewLoading = () => (
	<div className="flex h-[calc(100vh-57px)] gap-4 overflow-hidden bg-muted p-4">
		<div className="flex min-h-0 flex-1 flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
			<div className="flex items-center gap-3">
				<Skeleton className="h-9 flex-1 rounded-full" />
				<Skeleton className="h-9 w-36 rounded-full" />
				<Skeleton className="h-4 w-16 rounded" />
			</div>
			<div className="flex-1 overflow-hidden">
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
					{Array.from({ length: 12 }).map((_, i) => (
						<div
							key={i}
							className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]"
						>
							<div className="relative h-36 w-full overflow-hidden bg-gray-100">
								<Skeleton className="h-full w-full rounded-none" />
								<Skeleton className="absolute bottom-2 left-2 h-4 w-14 rounded-full" />
							</div>
							<div className="flex flex-col gap-1.5 px-3 pt-2.5 pb-3">
								<Skeleton className="h-3.5 w-4/5 rounded" />
								<Skeleton className="h-3 w-2/5 rounded" />
								<Skeleton className="mt-1 h-6 w-full rounded-xl" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
		<div className="flex w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl bg-gray-900 shadow-lg">
			<div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
				<Skeleton className="h-5 w-5 rounded bg-white/10" />
				<Skeleton className="h-4 w-32 rounded bg-white/10" />
			</div>
			<div className="flex flex-1 flex-col gap-3 px-4 py-3">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="flex gap-3 rounded-xl p-3">
						<Skeleton className="h-[52px] w-[52px] shrink-0 rounded-lg bg-white/10" />
						<div className="flex flex-1 flex-col gap-2">
							<Skeleton className="h-3 w-3/4 rounded bg-white/10" />
							<Skeleton className="h-3 w-1/2 rounded bg-white/10" />
							<Skeleton className="h-5 w-24 rounded bg-white/10" />
						</div>
					</div>
				))}
			</div>
			<div className="flex flex-col gap-3 border-t border-white/10 bg-black/20 px-5 py-4">
				<Skeleton className="h-3 w-28 rounded bg-white/10" />
				<Skeleton className="h-3 w-full rounded bg-white/10" />
				<Skeleton className="h-3 w-full rounded bg-white/10" />
				<Skeleton className="h-px w-full bg-white/10" />
				<Skeleton className="h-5 w-full rounded bg-white/10" />
				<Skeleton className="h-10 w-full rounded-xl bg-green-900" />
			</div>
		</div>
	</div>
);
