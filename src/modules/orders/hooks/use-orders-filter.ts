import {
	parseAsInteger,
	parseAsIsoDate,
	parseAsString,
	parseAsStringEnum,
	useQueryStates,
} from 'nuqs';
import { DEFAULT_PAGE } from '../../../../constants';

const STATUS_VALUES = ['pending', 'processing', 'completed', 'cancelled'] as const;

export const useOrdersFilters = () => {
	return useQueryStates({
		page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
		search: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
		status: parseAsStringEnum([...STATUS_VALUES]).withOptions({ clearOnDefault: true }),
		dateFrom: parseAsIsoDate.withOptions({ clearOnDefault: true }),
		dateTo: parseAsIsoDate.withOptions({ clearOnDefault: true }),
	});
};
