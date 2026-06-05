'use client';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontalIcon, Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STATUS_TRANSITIONS, type Order } from './order-constants';

interface Props {
	order: Order;
	onUpdate: (id: string, status: string) => void;
	isPending?: boolean;
}

export const OrderActionMenu = ({ order, onUpdate, isPending }: Props) => {
	const transitions = STATUS_TRANSITIONS[order.status] ?? [];
	if (transitions.length === 0) return <div className="h-8 w-8 shrink-0" />;
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					disabled={isPending}
					className="h-8 w-8 shrink-0 rounded-lg border-gray-200"
				>
					{isPending ? (
						<Loader2Icon className="h-4 w-4 animate-spin text-gray-400" />
					) : (
						<MoreHorizontalIcon className="h-4 w-4" />
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-52 p-1.5">
				<p className="px-2 pt-0.5 pb-1.5 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
					Change Status
				</p>
				{transitions.map((t) => (
					<DropdownMenuItem
						key={t.next}
						onClick={() => onUpdate(order.id, t.next)}
						className={cn(
							'cursor-pointer rounded-md px-3 py-2 text-sm',
							t.danger
								? 'text-red-500 focus:bg-red-50 focus:text-red-600'
								: 'focus:bg-green-50 focus:text-green-700'
						)}
					>
						<t.icon className="mr-2 h-3.5 w-3.5" />
						{t.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
