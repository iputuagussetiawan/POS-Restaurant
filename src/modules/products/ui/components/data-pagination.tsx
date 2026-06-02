'use client';

import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';

interface Props {
	page: number;
	total: number;
	totalPages: number;
	pageSize: number;
	onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

	if (current <= 4) return [1, 2, 3, 4, 5, 'ellipsis', total];
	if (current >= total - 3)
		return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];
	return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
}

const DataPagination = ({ page, total, totalPages, pageSize, onPageChange }: Props) => {
	const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const to = Math.min(page * pageSize, total);
	const pages = getPageNumbers(page, totalPages);

	return (
		<div className="flex flex-col items-center gap-4 border-t pt-4 sm:flex-row sm:justify-between">
			<p className="text-sm text-muted-foreground">
				{total === 0 ? 'No results' : `Showing ${from}–${to} of ${total} products`}
			</p>

			{totalPages > 1 && (
				<Pagination className="w-auto">
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								href="#"
								onClick={(e) => {
									e.preventDefault();
									if (page > 1) onPageChange(page - 1);
								}}
								className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
							/>
						</PaginationItem>

						{pages.map((p, i) =>
							p === 'ellipsis' ? (
								<PaginationItem key={`ellipsis-${i}`}>
									<PaginationEllipsis />
								</PaginationItem>
							) : (
								<PaginationItem key={p}>
									<PaginationLink
										href="#"
										isActive={p === page}
										onClick={(e) => {
											e.preventDefault();
											onPageChange(p);
										}}
									>
										{p}
									</PaginationLink>
								</PaginationItem>
							)
						)}

						<PaginationItem>
							<PaginationNext
								href="#"
								onClick={(e) => {
									e.preventDefault();
									if (page < totalPages) onPageChange(page + 1);
								}}
								className={
									page >= totalPages ? 'pointer-events-none opacity-50' : ''
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</div>
	);
};

export default DataPagination;
