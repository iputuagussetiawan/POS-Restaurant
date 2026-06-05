import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DiscountsGetMany } from '../../types';

export const discountsSelectColumn: ColumnDef<DiscountsGetMany[number]> = {
	id: 'select',
	header: ({ table }) => (
		<Checkbox
			checked={
				table.getIsAllPageRowsSelected() ||
				(table.getIsSomePageRowsSelected() && 'indeterminate')
			}
			onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
			aria-label="Select all"
		/>
	),
	cell: ({ row }) => (
		<Checkbox
			checked={row.getIsSelected()}
			onCheckedChange={(v) => row.toggleSelected(!!v)}
			onClick={(e) => e.stopPropagation()}
			aria-label="Select row"
		/>
	),
	meta: { className: 'w-10' },
};
