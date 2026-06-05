'use client';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { cn } from '@/lib/utils';
import { ClockIcon, RefreshCwIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';

const STATUS_WIDGET = [
	{
		key: 'pending',
		label: 'Pending',
		sub: 'Awaiting action',
		gradient: 'from-yellow-400 to-amber-500',
		glow: 'shadow-amber-100',
		text: 'text-amber-600',
		bar: 'bg-amber-400',
		icon: ClockIcon,
	},
	{
		key: 'processing',
		label: 'Processing',
		sub: 'Being prepared',
		gradient: 'from-blue-500 to-blue-600',
		glow: 'shadow-blue-100',
		text: 'text-blue-600',
		bar: 'bg-blue-500',
		icon: RefreshCwIcon,
	},
	{
		key: 'completed',
		label: 'Completed',
		sub: 'Successfully done',
		gradient: 'from-green-500 to-emerald-600',
		glow: 'shadow-green-100',
		text: 'text-green-600',
		bar: 'bg-green-500',
		icon: CheckCircleIcon,
	},
	{
		key: 'cancelled',
		label: 'Cancelled',
		sub: 'Did not proceed',
		gradient: 'from-red-400 to-rose-500',
		glow: 'shadow-red-100',
		text: 'text-red-500',
		bar: 'bg-red-400',
		icon: XCircleIcon,
	},
] as const;

interface Props {
	search?: string;
	dateFrom?: string;
	dateTo?: string;
}

export const OrderStatusCounts = ({ search, dateFrom, dateTo }: Props) => {
	const trpc = useTRPC();
	const { data } = useQuery(trpc.orders.statusCounts.queryOptions({ search, dateFrom, dateTo }));
	const total = data ? data.pending + data.processing + data.completed + data.cancelled : 0;

	return (
		<div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:gap-3">
			{STATUS_WIDGET.map(({ key, label, sub, gradient, glow, text, bar, icon: Icon }) => {
				const count = data ? data[key as keyof typeof data] : null;
				const pct = total > 0 && count != null ? Math.round((count / total) * 100) : 0;

				return (
					<div
						key={key}
						className={cn(
							'relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm',
							glow
						)}
					>
						<div className={cn('h-1 w-full bg-gradient-to-r', gradient)} />
						<div className="flex flex-col gap-3 p-4">
							<div className="flex items-center justify-between">
								<div
									className={cn(
										'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
										gradient
									)}
								>
									<Icon className="h-5 w-5" />
								</div>
								<span
									className={cn(
										'rounded-full px-2 py-0.5 text-[10px] font-semibold',
										pct > 0 ? cn('bg-opacity-10', text) : 'text-gray-400'
									)}
								>
									{data ? `${pct}%` : '—'}
								</span>
							</div>
							<div>
								<p
									className={cn(
										'text-3xl leading-none font-extrabold tabular-nums',
										text
									)}
								>
									{count ?? '—'}
								</p>
								<p className="mt-1 text-xs font-semibold text-gray-700">{label}</p>
								<p className="text-[10px] text-gray-400">{sub}</p>
							</div>
							<div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
								<div
									className={cn(
										'h-full rounded-full transition-all duration-500',
										bar
									)}
									style={{ width: `${pct}%` }}
								/>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};
