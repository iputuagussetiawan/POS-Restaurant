'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { AlertTriangleIcon, ClockIcon } from 'lucide-react';

interface Props {
	createdAt: string | Date;
}

export const KitchenOrderTimer = ({ createdAt }: Props) => {
	const [label, setLabel] = useState('');
	const [mins, setMins] = useState(0);

	useEffect(() => {
		const update = () => {
			setLabel(formatDistanceToNow(new Date(createdAt), { addSuffix: false }));
			setMins(Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000));
		};
		update();
		const id = setInterval(update, 10_000);
		return () => clearInterval(id);
	}, [createdAt]);

	const urgent = mins >= 15;
	const warning = mins >= 8;

	return (
		<span
			className={cn(
				'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums',
				urgent
					? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/40'
					: warning
						? 'bg-amber-500/20 text-amber-400'
						: 'bg-white/5 text-gray-500'
			)}
		>
			{urgent && <AlertTriangleIcon className="h-3 w-3 animate-pulse" />}
			<ClockIcon className={cn('h-3 w-3', urgent && 'hidden')} />
			{urgent && <ClockIcon className="hidden h-3 w-3" />}
			{label}
		</span>
	);
};
