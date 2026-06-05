import { cn } from '@/lib/utils';

interface Props {
	label: string;
	value: string;
	sub?: string;
	icon: React.ElementType;
	accent: string;
}

export const HistoryKpiCard = ({ label, value, sub, icon: Icon, accent }: Props) => (
	<div className="flex items-center gap-3 rounded-2xl bg-white p-4 md:gap-4 md:p-5">
		<div
			className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', accent)}
		>
			<Icon className="h-5 w-5 text-white" />
		</div>
		<div className="min-w-0">
			<p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
				{label}
			</p>
			<p className="truncate text-xl font-bold text-gray-900">{value}</p>
			{sub && <p className="text-xs text-gray-400">{sub}</p>}
		</div>
	</div>
);
