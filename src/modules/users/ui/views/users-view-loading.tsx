import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

export const UsersViewLoading = () => (
	<div className="flex flex-col gap-y-4 px-4 py-4 md:px-8">
		<Skeleton className="h-4 w-36" />
		<div className="overflow-hidden rounded-lg border bg-white">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/40 hover:bg-muted/40">
						{['Name', 'Role', 'Status', 'Joined', ''].map((h) => (
							<TableHead key={h} className="px-4 py-3">
								<Skeleton className="h-4 w-20" />
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 8 }).map((_, i) => (
						<TableRow key={i}>
							<TableCell className="px-4 py-3">
								<div className="flex flex-col gap-y-1">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-3 w-44" />
								</div>
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-6 w-24 rounded-full" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-5 w-16 rounded-full" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-8 w-8 rounded-md" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	</div>
);
