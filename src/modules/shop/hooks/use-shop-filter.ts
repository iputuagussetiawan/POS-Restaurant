import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { DEFAULT_PAGE } from '../../../../constants';

export type ShopSortOption =
	| 'newest'
	| 'oldest'
	| 'price_asc'
	| 'price_desc'
	| 'name_asc'
	| 'name_desc';

export const SHOP_SORT_OPTIONS: { value: ShopSortOption; label: string }[] = [
	{ value: 'newest', label: 'Newest' },
	{ value: 'oldest', label: 'Oldest' },
	{ value: 'price_asc', label: 'Price: Low to High' },
	{ value: 'price_desc', label: 'Price: High to Low' },
	{ value: 'name_asc', label: 'Name: A–Z' },
	{ value: 'name_desc', label: 'Name: Z–A' },
];

export const SHOP_PAGE_SIZE_OPTIONS = [12, 24, 48, 96] as const;
export type ShopPageSize = (typeof SHOP_PAGE_SIZE_OPTIONS)[number];

export const useShopFilters = () => {
	return useQueryStates({
		search: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
		page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
		categorySlug: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
		minPrice: parseAsInteger.withOptions({ clearOnDefault: true }),
		maxPrice: parseAsInteger.withOptions({ clearOnDefault: true }),
		sort: parseAsStringEnum<ShopSortOption>([
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
	});
};
