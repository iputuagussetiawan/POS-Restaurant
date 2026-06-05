'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { FilterIcon, SearchIcon, XIcon } from 'lucide-react';
import { HistoryDateRangePicker } from './history-date-range-picker';

const STATUS_OPTIONS = [
	{ value: 'all', label: 'All Statuses' },
	{ value: 'pending', label: 'Pending' },
	{ value: 'processing', label: 'Processing' },
	{ value: 'completed', label: 'Completed' },
	{ value: 'cancelled', label: 'Cancelled' },
] as const;

const PAYMENT_OPTIONS = [
	{ value: 'all', label: 'All Payments' },
	{ value: 'cash', label: 'Cash' },
	{ value: 'card', label: 'Card' },
	{ value: 'qris', label: 'QRIS' },
	{ value: 'transfer', label: 'Transfer' },
] as const;

interface Props {
	searchInput: string;
	status: string;
	paymentMethod: string;
	dateFrom: string;
	dateTo: string;
	hasActiveFilters: boolean;
	onSearchInputChange: (v: string) => void;
	onSearch: () => void;
	onStatusChange: (v: string) => void;
	onPaymentChange: (v: string) => void;
	onDateRangeChange: (from: string, to: string) => void;
	onClear: () => void;
}

export const HistoryFilters = ({
	searchInput,
	status,
	paymentMethod,
	dateFrom,
	dateTo,
	hasActiveFilters,
	onSearchInputChange,
	onSearch,
	onStatusChange,
	onPaymentChange,
	onDateRangeChange,
	onClear,
}: Props) => (
	<div className="rounded-2xl border bg-white p-3 md:p-4">
		<div className="flex flex-wrap items-center gap-2 md:gap-3">
			<FilterIcon className="h-4 w-4 shrink-0 text-gray-400" />

			<div className="relative w-full min-w-[160px] flex-1 sm:min-w-[200px]">
				<SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
				<Input
					value={searchInput}
					onChange={(e) => onSearchInputChange(e.target.value.toUpperCase())}
					onKeyDown={(e) => e.key === 'Enter' && onSearch()}
					placeholder="Order ID..."
					className="h-9 pl-9 font-mono text-sm uppercase shadow-none focus-visible:ring-0"
				/>
			</div>

			<Select value={status} onValueChange={onStatusChange}>
				<SelectTrigger className="h-9 w-40 shadow-none">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{STATUS_OPTIONS.map((o) => (
						<SelectItem key={o.value} value={o.value}>
							{o.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select value={paymentMethod} onValueChange={onPaymentChange}>
				<SelectTrigger className="h-9 w-40 shadow-none">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{PAYMENT_OPTIONS.map((o) => (
						<SelectItem key={o.value} value={o.value}>
							{o.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<HistoryDateRangePicker from={dateFrom} to={dateTo} onChange={onDateRangeChange} />

			<Button onClick={onSearch} size="sm" className="h-9 bg-green-600 hover:bg-green-700">
				<SearchIcon className="h-3.5 w-3.5" />
			</Button>

			{hasActiveFilters && (
				<Button onClick={onClear} size="sm" variant="outline" className="h-9 gap-1.5">
					<XIcon className="h-3.5 w-3.5" />
					Clear
				</Button>
			)}
		</div>
	</div>
);
