import { BanknoteIcon, CreditCardIcon, QrCodeIcon, ArrowRightLeftIcon } from 'lucide-react';

export type KitchenTab = 'pending' | 'processing';

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
