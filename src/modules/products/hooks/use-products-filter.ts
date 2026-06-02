import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../../../constants';

export const useProductsFilters = () => {
	return useQueryStates({
		search: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
		page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
		pageSize: parseAsInteger
			.withDefault(DEFAULT_PAGE_SIZE)
			.withOptions({ clearOnDefault: true }),
		categoryId: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
	});
};
