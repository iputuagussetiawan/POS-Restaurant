import { cn } from '@/lib/utils';
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from 'lucide-react';

interface Props {
	title: string;
	value: string;
	sub?: string;
	icon: React.ElementType;
	iconBg: string;
	trend?: number | null;
}

export const AnalyticsKpiCard = ({ title, value, sub, icon: Icon, iconBg, trend }: Props) => (
	<div className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm md:gap-3 md:p-5">
		<div className="flex items-center justify-between">
			<p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">{title}</p>
			<div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', iconBg)}>
				<Icon className="h-5 w-5 text-white" />
			</div>
		</div>
		<div>
			<p className="text-xl font-bold text-gray-900 md:text-2xl">{value}</p>
			{sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
		</div>
		{trend !== null && trend !== undefined && (
			<div
				className={cn(
					'flex items-center gap-1 text-xs font-semibold',
					trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-500' : 'text-gray-400'
				)}
			>
				{trend > 0 ? (
					<TrendingUpIcon className="h-3.5 w-3.5" />
				) : trend < 0 ? (
					<TrendingDownIcon className="h-3.5 w-3.5" />
				) : (
					<MinusIcon className="h-3.5 w-3.5" />
				)}
				{trend === 0 ? 'Same as yesterday' : `${Math.abs(trend).toFixed(1)}% vs yesterday`}
			</div>
		)}
	</div>
);
