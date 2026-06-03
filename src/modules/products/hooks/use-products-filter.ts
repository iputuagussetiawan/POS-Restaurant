import { parseAsArrayOf, parseAsFloat, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../../../constants';

export const PRICE_RANGE_MAX = 200;

export const useProductsFilters = () => {
	return useQueryStates({
		search: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
		page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
		pageSize: parseAsInteger
			.withDefault(DEFAULT_PAGE_SIZE)
			.withOptions({ clearOnDefault: true }),
		categorySlugs: parseAsArrayOf(parseAsString)
			.withDefault([])
			.withOptions({ clearOnDefault: true }),
		minPrice: parseAsFloat.withDefault(0).withOptions({ clearOnDefault: true }),
		maxPrice: parseAsFloat.withDefault(PRICE_RANGE_MAX).withOptions({ clearOnDefault: true }),
	});
};
