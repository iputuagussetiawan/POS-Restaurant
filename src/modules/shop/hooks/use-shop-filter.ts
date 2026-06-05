import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { DEFAULT_PAGE } from '../../../../constants';

export const useShopFilters = () => {
	return useQueryStates({
		search: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
		page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
		categorySlug: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
		minPrice: parseAsInteger.withOptions({ clearOnDefault: true }),
		maxPrice: parseAsInteger.withOptions({ clearOnDefault: true }),
	});
};
