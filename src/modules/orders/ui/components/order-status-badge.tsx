import { cn } from '@/lib/utils';

type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
	pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
	processing: { label: 'Processing', className: 'bg-blue-100 text-blue-700 border-blue-200' },
	completed: { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-200' },
	cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700 border-red-200' },
};

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
	const config = STATUS_CONFIG[status];
	return (
		<span
			className={cn(
				'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
				config.className
			)}
		>
			{config.label}
		</span>
	);
};
