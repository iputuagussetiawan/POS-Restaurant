import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../../../constants';

export const useUsersFilters = () => {
	return useQueryStates({
		search: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
		page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
		pageSize: parseAsInteger
			.withDefault(DEFAULT_PAGE_SIZE)
			.withOptions({ clearOnDefault: true }),
		role: parseAsStringEnum(['admin', 'manager', 'cashier', 'pending']).withOptions({
			clearOnDefault: true,
		}),
		status: parseAsStringEnum(['active', 'banned']).withOptions({ clearOnDefault: true }),
	});
};
