import {
	createLoader,
	parseAsArrayOf,
	parseAsFloat,
	parseAsInteger,
	parseAsString,
} from 'nuqs/server';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../../constants';
import { PRICE_RANGE_MAX } from './hooks/use-products-filter';

export const filtersSearchParams = {
	search: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
	page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
	pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE).withOptions({ clearOnDefault: true }),
	categorySlugs: parseAsArrayOf(parseAsString)
		.withDefault([])
		.withOptions({ clearOnDefault: true }),
	minPrice: parseAsFloat.withDefault(0).withOptions({ clearOnDefault: true }),
	maxPrice: parseAsFloat.withDefault(PRICE_RANGE_MAX).withOptions({ clearOnDefault: true }),
};

export const loadSearchParams = createLoader(filtersSearchParams);
