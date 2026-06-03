'use client';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

interface Props {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

const SIBLINGS = 1;

function getPageNumbers(current: number, total: number): (number | '...')[] {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

	const left = Math.max(2, current - SIBLINGS);
	const right = Math.min(total - 1, current + SIBLINGS);
	const pages: (number | '...')[] = [1];

	if (left > 2) pages.push('...');
	for (let i = left; i <= right; i++) pages.push(i);
	if (right < total - 1) pages.push('...');
	pages.push(total);

	return pages;
}

const PosPagination = ({ page, totalPages, onPageChange }: Props) => {
	if (totalPages <= 1) return null;
	const pages = getPageNumbers(page, totalPages);

	return (
		<div className="flex items-center justify-center gap-1">
			<button
				onClick={() => onPageChange(page - 1)}
				disabled={page === 1}
				className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-green-500 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-40"
			>
				<ChevronLeftIcon className="h-4 w-4" />
			</button>

			{pages.map((p, i) =>
				p === '...' ? (
					<span
						key={`ellipsis-${i}`}
						className="flex h-8 w-8 items-center justify-center text-xs text-gray-400"
					>
						···
					</span>
				) : (
					<button
						key={p}
						onClick={() => onPageChange(p)}
						className={cn(
							'flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-medium transition-all',
							p === page
								? 'border-green-600 bg-green-600 text-white shadow-sm'
								: 'border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600'
						)}
					>
						{p}
					</button>
				)
			)}

			<button
				onClick={() => onPageChange(page + 1)}
				disabled={page === totalPages}
				className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-green-500 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-40"
			>
				<ChevronRightIcon className="h-4 w-4" />
			</button>
		</div>
	);
};

export default PosPagination;
