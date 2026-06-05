import {
	ClockIcon,
	RefreshCwIcon,
	CheckCircleIcon,
	XCircleIcon,
	BanknoteIcon,
	CreditCardIcon,
	QrCodeIcon,
	ArrowRightLeftIcon,
} from 'lucide-react';

export type Order = {
	id: string;
	status: string;
	subtotal: string;
	tax: string;
	serviceCharge: string;
	total: string;
	note?: string | null;
	paymentMethod?: string | null;
	customerName?: string | null;
	customerId?: string | null;
	cashierId?: string | null;
	createdAt: Date;
	customerName2?: string | null;
	customerPhone?: string | null;
	cashierName?: string | null;
	itemCount?: number | null;
};

export const STATUS_ICON: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
	pending: { icon: ClockIcon, bg: 'bg-yellow-100', color: 'text-yellow-600' },
	processing: { icon: RefreshCwIcon, bg: 'bg-blue-100', color: 'text-blue-600' },
	completed: { icon: CheckCircleIcon, bg: 'bg-green-100', color: 'text-green-600' },
	cancelled: { icon: XCircleIcon, bg: 'bg-red-100', color: 'text-red-500' },
};

export const PAYMENT_ICON: Record<string, React.ElementType> = {
	cash: BanknoteIcon,
	card: CreditCardIcon,
	qris: QrCodeIcon,
	transfer: ArrowRightLeftIcon,
};

export const PAYMENT_LABEL: Record<string, string> = {
	cash: 'Cash',
	card: 'Card',
	qris: 'QRIS',
	transfer: 'Transfer',
};

export const STATUS_TRANSITIONS: Record<
	string,
	{ next: string; label: string; icon: React.ElementType; danger?: boolean }[]
> = {
	pending: [
		{ next: 'processing', label: 'Mark Processing', icon: RefreshCwIcon },
		{ next: 'cancelled', label: 'Cancel Order', icon: XCircleIcon, danger: true },
	],
	processing: [
		{ next: 'completed', label: 'Mark Completed', icon: CheckCircleIcon },
		{ next: 'cancelled', label: 'Cancel Order', icon: XCircleIcon, danger: true },
	],
	completed: [],
	cancelled: [],
};

export const GRADIENT: Record<string, string> = {
	completed: 'from-green-500 to-emerald-600',
	processing: 'from-blue-500 to-blue-600',
	pending: 'from-yellow-400 to-amber-500',
	cancelled: 'from-red-400 to-rose-500',
};
