'use client';

import { Loader2Icon, ReceiptIcon, XIcon } from 'lucide-react';
import Receipt from './receipt';

type OrderFull = Parameters<typeof Receipt>[0]['order'];
type Order = Omit<OrderFull, 'createdAt'> & { createdAt: Date | string };

interface Props {
	isFetching: boolean;
	showEmpty: boolean;
	showNotFound: boolean;
	showReceipt: boolean;
	order?: Order | null;
	searchId: string;
	onClear: () => void;
}

export const BillReceiptArea = ({
	isFetching,
	showEmpty,
	showNotFound,
	showReceipt,
	order,
	searchId,
	onClear,
}: Props) => (
	<div className="flex flex-1 flex-col">
		{isFetching && (
			<div className="flex flex-1 items-center justify-center">
				<Loader2Icon className="h-8 w-8 animate-spin text-green-600" />
			</div>
		)}

		{showEmpty && (
			<div className="flex flex-1 flex-col items-center justify-center gap-4">
				<div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm">
					<ReceiptIcon className="h-10 w-10 text-green-700" />
				</div>
				<div className="text-center">
					<p className="text-sm font-semibold text-gray-700">Select or search an order</p>
					<p className="mt-1 text-xs text-gray-400">
						Click a recent order on the left, or type the Order ID above
					</p>
				</div>
			</div>
		)}

		{showNotFound && (
			<div className="flex flex-1 flex-col items-center justify-center gap-3">
				<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
					<XIcon className="h-8 w-8 text-red-400" />
				</div>
				<div className="text-center">
					<p className="text-sm font-semibold text-gray-700">Order not found</p>
					<p className="mt-1 text-xs text-gray-400">
						No order starts with{' '}
						<span className="font-mono font-bold">#{searchId.toUpperCase()}</span>
					</p>
					<button
						onClick={onClear}
						className="mt-2 text-xs text-green-600 hover:underline"
					>
						Clear and try again
					</button>
				</div>
			</div>
		)}

		{showReceipt && order && (
			<div className="mx-auto w-full max-w-sm">
				<Receipt order={{ ...order, createdAt: new Date(order.createdAt) }} />
			</div>
		)}
	</div>
);
