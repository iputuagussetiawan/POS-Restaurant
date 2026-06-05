import { createLoader, parseAsInteger, parseAsString } from 'nuqs/server';
import { DEFAULT_PAGE } from '../../constants';

export const shopSearchParams = {
	search: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
	page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
	categorySlug: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
	minPrice: parseAsInteger.withOptions({ clearOnDefault: true }),
	maxPrice: parseAsInteger.withOptions({ clearOnDefault: true }),
};

export const loadShopSearchParams = createLoader(shopSearchParams);
