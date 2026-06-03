'use client';
import { useOrdersFilters } from '@/modules/orders/hooks/use-orders-filter';
import { cn } from '@/lib/utils';
import {
	ClipboardListIcon,
	SearchIcon,
	XIcon,
	LayoutGridIcon,
	ListIcon,
	CalendarIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, isToday, subDays, addDays } from 'date-fns';
import { useState } from 'react';

type ViewMode = 'grid' | 'table';

const STATUSES = [
	{ value: null, label: 'All', dot: 'bg-gray-400' },
	{ value: 'pending', label: 'Pending', dot: 'bg-yellow-400' },
	{ value: 'processing', label: 'Processing', dot: 'bg-blue-400' },
	{ value: 'completed', label: 'Completed', dot: 'bg-green-500' },
	{ value: 'cancelled', label: 'Cancelled', dot: 'bg-red-400' },
] as const;

interface Props {
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
}

const OrderListHeader = ({ viewMode, onViewModeChange }: Props) => {
	const [filters, setFilters] = useOrdersFilters();
	const [searchValue, setSearchValue] = useState(filters.search || '');

	const commitSearch = (val: string) => setFilters({ search: val, page: 1 });

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') commitSearch(searchValue);
	};

	const handleClear = () => {
		setSearchValue('');
		commitSearch('');
	};

	return (
		<div className="border-b bg-white px-6 py-4">
			<div className="flex items-center gap-4">
				{/* Title */}
				<div className="flex shrink-0 items-center gap-3">
					<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-700">
						<ClipboardListIcon className="h-5 w-5 text-white" />
					</div>
					<div>
						<h1 className="text-base font-semibold text-gray-900">Order List</h1>
						<p className="text-xs text-gray-400">Track and manage your orders</p>
					</div>
				</div>

				{/* Controls */}
				<div className="flex flex-1 items-center justify-end gap-3">
					{/* Date picker */}
					<div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-1 py-1">
						<button
							onClick={() =>
								setFilters({
									date: subDays(filters.date ?? new Date(), 1),
									page: 1,
								})
							}
							className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
						>
							<ChevronLeftIcon className="h-3.5 w-3.5" />
						</button>
						<Popover>
							<PopoverTrigger asChild>
								<button className="flex items-center gap-1.5 px-2 text-xs font-medium text-gray-700 transition-colors hover:text-green-700">
									<CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
									<span
										className={cn(
											isToday(filters.date ?? new Date()) &&
												'font-semibold text-green-700'
										)}
									>
										{filters.date
											? isToday(filters.date)
												? 'Today'
												: format(filters.date, 'dd MMM yyyy')
											: 'Today'}
									</span>
								</button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="center">
								<Calendar
									mode="single"
									selected={filters.date ?? new Date()}
									onSelect={(d) => d && setFilters({ date: d, page: 1 })}
									initialFocus
									disabled={(d) => d > new Date()}
								/>
								<div className="border-t px-3 py-2">
									<button
										onClick={() => setFilters({ date: new Date(), page: 1 })}
										className="text-xs font-medium text-green-700 hover:underline"
									>
										Back to Today
									</button>
								</div>
							</PopoverContent>
						</Popover>
						<button
							onClick={() => {
								const next = addDays(filters.date ?? new Date(), 1);
								if (next <= new Date()) setFilters({ date: next, page: 1 });
							}}
							className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
							disabled={isToday(filters.date ?? new Date())}
						>
							<ChevronRightIcon className="h-3.5 w-3.5" />
						</button>
					</div>

					{/* Search */}
					<div className="relative w-52">
						<SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
						<Input
							value={searchValue}
							onChange={(e) => setSearchValue(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Search order ID..."
							className="h-9 rounded-full border-gray-200 pr-8 pl-9 text-sm shadow-none placeholder:text-gray-400 focus-visible:border-green-500 focus-visible:ring-0"
						/>
						{searchValue && (
							<button
								onClick={handleClear}
								className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
							>
								<XIcon className="h-3.5 w-3.5" />
							</button>
						)}
					</div>

					{/* Status filter */}
					<div className="flex items-center gap-1 rounded-xl border border-gray-100 bg-gray-50 p-1">
						{STATUSES.map((s) => {
							const isActive = (filters.status ?? null) === s.value;
							return (
								<button
									key={String(s.value)}
									onClick={() =>
										setFilters({ status: s.value as never, page: 1 })
									}
									className={cn(
										'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150',
										isActive
											? 'bg-white text-gray-900 shadow-sm'
											: 'text-gray-500 hover:text-gray-700'
									)}
								>
									<span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
									{s.label}
								</button>
							);
						})}
					</div>

					{/* View toggle */}
					<div className="flex items-center gap-1 rounded-xl border border-gray-100 bg-gray-50 p-1">
						<button
							onClick={() => onViewModeChange('grid')}
							className={cn(
								'flex h-7 w-7 items-center justify-center rounded-lg transition-all',
								viewMode === 'grid'
									? 'bg-white text-gray-900 shadow-sm'
									: 'text-gray-400 hover:text-gray-600'
							)}
						>
							<LayoutGridIcon className="h-4 w-4" />
						</button>
						<button
							onClick={() => onViewModeChange('table')}
							className={cn(
								'flex h-7 w-7 items-center justify-center rounded-lg transition-all',
								viewMode === 'table'
									? 'bg-white text-gray-900 shadow-sm'
									: 'text-gray-400 hover:text-gray-600'
							)}
						>
							<ListIcon className="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderListHeader;
