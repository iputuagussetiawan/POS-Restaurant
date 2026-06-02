import { createLoader, parseAsInteger, parseAsString } from 'nuqs/server';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../../constants';

export const filtersSearchParams = {
	search: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
	page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
	pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE).withOptions({ clearOnDefault: true }),
	categoryId: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
};

export const loadSearchParams = createLoader(filtersSearchParams);
