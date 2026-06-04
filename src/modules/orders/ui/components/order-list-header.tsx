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
	BarChart2Icon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
	format,
	isToday,
	startOfDay,
	endOfDay,
	subDays,
	startOfWeek,
	startOfMonth,
	endOfMonth,
} from 'date-fns';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import OrderChartDialog from './order-chart-dialog';

type ViewMode = 'grid' | 'table';

const STATUSES = [
	{ value: null, label: 'All', dot: 'bg-gray-400' },
	{ value: 'pending', label: 'Pending', dot: 'bg-yellow-400' },
	{ value: 'processing', label: 'Processing', dot: 'bg-blue-400' },
	{ value: 'completed', label: 'Completed', dot: 'bg-green-500' },
	{ value: 'cancelled', label: 'Cancelled', dot: 'bg-red-400' },
] as const;

const PRESETS = [
	{
		label: 'Today',
		getRange: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }),
	},
	{
		label: 'Yesterday',
		getRange: () => {
			const d = subDays(new Date(), 1);
			return { from: startOfDay(d), to: endOfDay(d) };
		},
	},
	{
		label: 'Last 7 days',
		getRange: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }),
	},
	{
		label: 'This week',
		getRange: () => ({
			from: startOfWeek(new Date(), { weekStartsOn: 1 }),
			to: endOfDay(new Date()),
		}),
	},
	{
		label: 'This month',
		getRange: () => ({ from: startOfMonth(new Date()), to: endOfDay(new Date()) }),
	},
	{
		label: 'Last month',
		getRange: () => {
			const d = subDays(startOfMonth(new Date()), 1);
			return { from: startOfMonth(d), to: endOfMonth(d) };
		},
	},
];

interface Props {
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
}

const OrderListHeader = ({ viewMode, onViewModeChange }: Props) => {
	const [filters, setFilters] = useOrdersFilters();
	const [searchValue, setSearchValue] = useState(filters.search || '');
	const [calOpen, setCalOpen] = useState(false);
	const [chartOpen, setChartOpen] = useState(false);

	const commitSearch = (val: string) => setFilters({ search: val, page: 1 });
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') commitSearch(searchValue);
	};
	const handleClear = () => {
		setSearchValue('');
		commitSearch('');
	};

	const dateFrom = filters.dateFrom ?? null;
	const dateTo = filters.dateTo ?? null;

	const hasDateFilter = !!(dateFrom || dateTo);

	const dateLabel = () => {
		if (!dateFrom && !dateTo) return 'All dates';
		if (dateFrom && dateTo) {
			if (isToday(dateFrom) && isToday(dateTo)) return 'Today';
			if (dateFrom.toDateString() === dateTo.toDateString())
				return format(dateFrom, 'dd MMM yyyy');
			return `${format(dateFrom, 'dd MMM')} – ${format(dateTo, 'dd MMM yyyy')}`;
		}
		if (dateFrom) return `From ${format(dateFrom, 'dd MMM yyyy')}`;
		return `Until ${format(dateTo!, 'dd MMM yyyy')}`;
	};

	const applyPreset = (getRange: () => { from: Date; to: Date }) => {
		const { from, to } = getRange();
		setFilters({ dateFrom: from, dateTo: to, page: 1 });
		setCalOpen(false);
	};

	const clearDates = () => setFilters({ dateFrom: null, dateTo: null, page: 1 });

	const handleRangeSelect = (range: DateRange | undefined) => {
		setFilters({
			dateFrom: range?.from ?? null,
			dateTo: range?.to ?? null,
			page: 1,
		});
	};

	const isAnyFilterActive = hasDateFilter || !!filters.search || !!filters.status;

	const toLocalDate = (d: Date) =>
		`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	const dateFromStr = dateFrom ? toLocalDate(dateFrom) : undefined;
	const dateToStr = dateTo ? toLocalDate(dateTo) : undefined;

	return (
		<div>
			<OrderChartDialog
				open={chartOpen}
				onOpenChange={setChartOpen}
				search={filters.search || undefined}
				dateFrom={dateFromStr}
				dateTo={dateToStr}
			/>
			<div className="border-b bg-white px-6 py-4">
				<div className="flex flex-wrap items-center gap-3">
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
					<div className="flex flex-1 flex-wrap items-center justify-end gap-2">
						{/* Date range picker */}
						<Popover open={calOpen} onOpenChange={setCalOpen}>
							<PopoverTrigger asChild>
								<button
									className={cn(
										'flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors',
										hasDateFilter
											? 'border-green-500 bg-green-50 text-green-700'
											: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
									)}
								>
									<CalendarIcon className="h-3.5 w-3.5 shrink-0" />
									<span>{dateLabel()}</span>
									{hasDateFilter && (
										<span
											className="ml-1 text-green-500 hover:text-green-700"
											onClick={(e) => {
												e.stopPropagation();
												clearDates();
											}}
										>
											<XIcon className="h-3 w-3" />
										</span>
									)}
								</button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="end">
								<div className="flex">
									{/* Presets */}
									<div className="flex flex-col gap-0.5 border-r p-3 text-xs">
										<p className="mb-1.5 px-2 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
											Quick select
										</p>
										{PRESETS.map((p) => (
											<button
												key={p.label}
												onClick={() => applyPreset(p.getRange)}
												className="rounded-md px-3 py-1.5 text-left text-xs text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
											>
												{p.label}
											</button>
										))}
										{hasDateFilter && (
											<button
												onClick={() => {
													clearDates();
													setCalOpen(false);
												}}
												className="mt-1 rounded-md px-3 py-1.5 text-left text-xs text-red-500 transition-colors hover:bg-red-50"
											>
												Clear dates
											</button>
										)}
									</div>
									{/* Calendar */}
									<div>
										<Calendar
											mode="range"
											selected={{
												from: dateFrom ?? undefined,
												to: dateTo ?? undefined,
											}}
											onSelect={handleRangeSelect}
											numberOfMonths={2}
											initialFocus
											disabled={(d) => d > new Date()}
										/>
										{dateFrom && dateTo && (
											<div className="border-t px-4 py-2 text-xs text-gray-500">
												{format(dateFrom, 'dd MMM yyyy')} →{' '}
												{format(dateTo, 'dd MMM yyyy')}
											</div>
										)}
									</div>
								</div>
							</PopoverContent>
						</Popover>

						{/* Search */}
						<div className="relative w-48">
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

						{/* Clear all filters */}
						{isAnyFilterActive && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									clearDates();
									setSearchValue('');
									setFilters({ search: '', status: null, page: 1 });
								}}
								className="h-9 gap-1.5 rounded-full px-3 text-xs text-gray-500 hover:text-gray-800"
							>
								<XIcon className="h-3 w-3" />
								Clear all
							</Button>
						)}

						{/* Analytics button */}
						<Button
							onClick={() => setChartOpen(true)}
							size="sm"
							className="h-9 gap-2 rounded-full bg-green-700 px-4 text-xs font-semibold text-white shadow-sm hover:bg-green-800"
						>
							<BarChart2Icon className="h-3.5 w-3.5" />
							Analytics
						</Button>

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
		</div>
	);
};

export default OrderListHeader;
