import { createLoader, parseAsInteger, parseAsString, parseAsStringEnum } from 'nuqs/server';
import { DEFAULT_PAGE } from '../../constants';

export const shopSearchParams = {
	search: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
	page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
	categorySlug: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
	minPrice: parseAsInteger.withOptions({ clearOnDefault: true }),
	maxPrice: parseAsInteger.withOptions({ clearOnDefault: true }),
	sort: parseAsStringEnum([
		'newest',
		'oldest',
		'price_asc',
		'price_desc',
		'name_asc',
		'name_desc',
	])
		.withDefault('newest')
		.withOptions({ clearOnDefault: true }),
	pageSize: parseAsInteger.withDefault(24).withOptions({ clearOnDefault: true }),
};

export const loadShopSearchParams = createLoader(shopSearchParams);
