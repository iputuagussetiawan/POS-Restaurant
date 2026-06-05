'use client';

import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useShopCurrency() {
	const trpc = useTRPC();
	const { data: settings } = useQuery(trpc.shop.getSettings.queryOptions());

	const code = settings?.currencyCode ?? 'IDR';
	const symbol = settings?.currencySymbol ?? 'Rp';

	const format = useCallback(
		(amount: number | string) => {
			try {
				return new Intl.NumberFormat('id-ID', {
					style: 'currency',
					currency: code,
					minimumFractionDigits: 0,
					maximumFractionDigits: 0,
				}).format(Number(amount));
			} catch {
				return `${symbol}${Number(amount).toLocaleString()}`;
			}
		},
		[code, symbol]
	);

	return { format, code, symbol };
}
