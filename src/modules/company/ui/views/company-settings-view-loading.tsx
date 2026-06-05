import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export const CompanySettingsViewLoading = () => (
	<div className="flex flex-1 flex-col">
		<div className="border-b bg-white px-6 py-5">
			<div className="flex items-center gap-3">
				<Skeleton className="h-10 w-10 rounded-xl" />
				<div className="space-y-1.5">
					<Skeleton className="h-4 w-40 rounded" />
					<Skeleton className="h-3 w-64 rounded" />
				</div>
			</div>
		</div>
		<div className="flex flex-1 overflow-hidden bg-muted/40">
			<div className="flex w-52 shrink-0 flex-col gap-1 border-r bg-white px-3 py-4">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
						<Skeleton className="h-8 w-8 rounded-lg" />
						<div className="space-y-1">
							<Skeleton className="h-3 w-20 rounded" />
							<Skeleton className="h-2.5 w-16 rounded" />
						</div>
					</div>
				))}
			</div>
			<div className="flex-1 p-6">
				<div className="mx-auto max-w-3xl rounded-2xl border bg-white shadow-sm">
					<div className="grid gap-0 md:grid-cols-[200px_1fr]">
						<div className="flex flex-col items-center gap-4 rounded-l-2xl border-r bg-gray-50 px-6 py-8">
							<Skeleton className="h-24 w-24 rounded-2xl" />
							<Skeleton className="h-4 w-24 rounded" />
						</div>
						<div className="space-y-4 px-6 py-6">
							{Array.from({ length: 6 }).map((_, i) => (
								<div key={i} className="space-y-2">
									<Skeleton className="h-3 w-20 rounded" />
									<Skeleton className="h-9 w-full rounded-lg" />
								</div>
							))}
						</div>
					</div>
					<Separator />
					<div className="flex justify-end px-6 py-4">
						<Skeleton className="h-9 w-32 rounded-lg" />
					</div>
				</div>
			</div>
		</div>
	</div>
);
