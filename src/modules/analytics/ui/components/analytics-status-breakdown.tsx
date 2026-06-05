interface StatusEntry {
	name: string;
	value: number;
	color: string;
}

interface Props {
	data: StatusEntry[];
}

export const AnalyticsStatusBreakdown = ({ data }: Props) => (
	<div className="rounded-2xl bg-white p-4 shadow-sm md:p-5">
		<p className="mb-3 text-sm font-semibold text-gray-800">Order Status</p>
		<div className="flex flex-col gap-2">
			{data.map((s) => {
				const total = data.reduce((a, b) => a + b.value, 0);
				const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
				return (
					<div key={s.name} className="flex flex-col gap-1">
						<div className="flex items-center justify-between text-xs">
							<span className="flex items-center gap-1.5 text-gray-600 capitalize">
								<span
									className="h-2 w-2 rounded-full"
									style={{ background: s.color }}
								/>
								{s.name}
							</span>
							<span className="font-semibold text-gray-800">
								{s.value} ({pct}%)
							</span>
						</div>
						<div className="h-1.5 w-full rounded-full bg-gray-100">
							<div
								className="h-1.5 rounded-full transition-all"
								style={{ width: `${pct}%`, background: s.color }}
							/>
						</div>
					</div>
				);
			})}
		</div>
	</div>
);
