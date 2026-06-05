import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

export const ProductViewLoading = () => (
	<div className="flex flex-col gap-y-4">
		<Skeleton className="h-4 w-36" />
		<div className="overflow-hidden rounded-lg border bg-white">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/40 hover:bg-muted/40">
						<TableHead className="px-4 py-3">
							<Skeleton className="h-4 w-28" />
						</TableHead>
						<TableHead className="px-4 py-3">
							<Skeleton className="h-4 w-20" />
						</TableHead>
						<TableHead className="px-4 py-3">
							<Skeleton className="h-4 w-16" />
						</TableHead>
						<TableHead className="px-4 py-3">
							<Skeleton className="h-4 w-16" />
						</TableHead>
						<TableHead className="px-4 py-3">
							<Skeleton className="h-4 w-20" />
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 8 }).map((_, i) => (
						<TableRow key={i}>
							<TableCell className="px-4 py-3">
								<div className="flex items-center gap-x-3">
									<Skeleton className="size-10 shrink-0 rounded-lg" />
									<div className="flex flex-col gap-y-1">
										<Skeleton className="h-4 w-36" />
										<Skeleton className="h-3 w-24" />
									</div>
								</div>
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-5 w-24 rounded-full" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-4 w-14" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-5 w-20 rounded-full" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-4 w-24" />
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
