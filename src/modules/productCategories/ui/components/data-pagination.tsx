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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

interface Props {
	page: number;
	total: number;
	totalPages: number;
	pageSize: number;
	onPageChange: (page: number) => void;
	onPageSizeChange?: (pageSize: number) => void;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
	if (current <= 4) return [1, 2, 3, 4, 5, 'ellipsis', total];
	if (current >= total - 3)
		return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];
	return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
}

const DataPagination = ({
	page,
	total,
	totalPages,
	pageSize,
	onPageChange,
	onPageSizeChange,
}: Props) => {
	const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const to = Math.min(page * pageSize, total);
	const pages = getPageNumbers(page, totalPages);

	return (
		<div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-x-4">
				{onPageSizeChange && (
					<div className="flex items-center gap-x-2">
						<span className="text-sm whitespace-nowrap text-muted-foreground">
							Rows per page
						</span>
						<Select
							value={String(pageSize)}
							onValueChange={(v) => {
								onPageSizeChange(Number(v));
								onPageChange(1);
							}}
						>
							<SelectTrigger size="sm" className="w-20 font-medium">
								<SelectValue />
							</SelectTrigger>
							<SelectContent align="end">
								{PAGE_SIZE_OPTIONS.map((size) => (
									<SelectItem key={size} value={String(size)}>
										{size}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
				<p className="text-sm whitespace-nowrap text-muted-foreground">
					{total === 0 ? 'No results' : `${from}–${to} of ${total}`}
				</p>
			</div>

			{totalPages > 1 && (
				<Pagination className="mx-0 w-auto justify-start sm:ml-auto sm:justify-end">
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
