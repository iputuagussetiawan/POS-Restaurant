import { createLoader, parseAsInteger, parseAsString } from 'nuqs/server';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../../constants';

export const discountSearchParams = {
	search: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
	status: parseAsString.withDefault('all').withOptions({ clearOnDefault: true }),
	page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
	pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE).withOptions({ clearOnDefault: true }),
};

export const loadDiscountSearchParams = createLoader(discountSearchParams);
