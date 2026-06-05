'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';

const PRESETS = [
	{
		label: 'Today',
		get: () => {
			const d = format(new Date(), 'yyyy-MM-dd');
			return { from: d, to: d };
		},
	},
	{
		label: 'Yesterday',
		get: () => {
			const d = new Date();
			d.setDate(d.getDate() - 1);
			const s = format(d, 'yyyy-MM-dd');
			return { from: s, to: s };
		},
	},
	{
		label: 'Last 7 days',
		get: () => {
			const to = new Date();
			const from = new Date();
			from.setDate(from.getDate() - 6);
			return { from: format(from, 'yyyy-MM-dd'), to: format(to, 'yyyy-MM-dd') };
		},
	},
	{
		label: 'This month',
		get: () => {
			const now = new Date();
			const from = new Date(now.getFullYear(), now.getMonth(), 1);
			return { from: format(from, 'yyyy-MM-dd'), to: format(now, 'yyyy-MM-dd') };
		},
	},
];

interface Props {
	from: string;
	to: string;
	onChange: (from: string, to: string) => void;
}

export const HistoryDateRangePicker = ({ from, to, onChange }: Props) => {
	const [open, setOpen] = useState(false);

	const range = {
		from: from ? new Date(from + 'T00:00:00') : undefined,
		to: to ? new Date(to + 'T00:00:00') : undefined,
	};

	const label =
		from && to && from === to
			? format(range.from!, 'dd MMM yyyy')
			: from && to
				? `${format(range.from!, 'dd MMM yyyy')} – ${format(range.to!, 'dd MMM yyyy')}`
				: from
					? `From ${format(range.from!, 'dd MMM yyyy')}`
					: 'Pick date range';

	const applyPreset = (preset: (typeof PRESETS)[number]) => {
		const { from, to } = preset.get();
		onChange(from, to);
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className={cn(
						'h-9 min-w-[200px] justify-start gap-2 text-sm font-normal shadow-none',
						!from && !to && 'text-muted-foreground'
					)}
				>
					<CalendarIcon className="h-3.5 w-3.5 shrink-0" />
					{label}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="end">
				<div className="flex gap-1.5 border-b px-3 py-2.5">
					{PRESETS.map((p) => (
						<Button
							key={p.label}
							variant="outline"
							size="sm"
							className="h-7 px-2.5 text-xs"
							onClick={() => applyPreset(p)}
						>
							{p.label}
						</Button>
					))}
				</div>
				<Calendar
					mode="range"
					selected={range}
					onSelect={(r) => {
						onChange(
							r?.from ? format(r.from, 'yyyy-MM-dd') : '',
							r?.to ? format(r.to, 'yyyy-MM-dd') : ''
						);
						if (r?.from && r?.to) setOpen(false);
					}}
					numberOfMonths={2}
					initialFocus
				/>
				{(from || to) && (
					<div className="border-t px-3 py-2">
						<Button
							variant="ghost"
							size="sm"
							className="h-7 w-full text-xs text-muted-foreground"
							onClick={() => {
								onChange('', '');
								setOpen(false);
							}}
						>
							Clear range
						</Button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
};
