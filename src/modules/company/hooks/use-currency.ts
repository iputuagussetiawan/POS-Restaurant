'use client';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useCurrency() {
	const trpc = useTRPC();
	const { data: company } = useQuery(trpc.company.get.queryOptions());

	const code = company?.currencyCode ?? 'USD';
	const locale = company?.currencyLocale ?? 'en-US';

	const format = useCallback(
		(amount: number | string) =>
			new Intl.NumberFormat(locale, {
				style: 'currency',
				currency: code,
				minimumFractionDigits: 2,
			}).format(Number(amount)),
		[code, locale]
	);

	return { format, code, locale, symbol: company?.currencySymbol ?? '$' };
}
