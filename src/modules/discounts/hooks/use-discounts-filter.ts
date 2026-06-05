import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../../../constants';

const STATUS_VALUES = ['all', 'active', 'inactive'] as const;

export const useDiscountsFilters = () => {
	return useQueryStates({
		search: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
		status: parseAsStringLiteral(STATUS_VALUES)
			.withDefault('all')
			.withOptions({ clearOnDefault: true }),
		page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
		pageSize: parseAsInteger
			.withDefault(DEFAULT_PAGE_SIZE)
			.withOptions({ clearOnDefault: true }),
	});
};
