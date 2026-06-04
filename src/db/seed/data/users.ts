import type { UserRole } from '../../schema/enums';

export const usersData: {
	name: string;
	email: string;
	password: string;
	role: UserRole;
}[] = [
	{
		name: 'Admin User',
		email: 'admin@foodorder.com',
		password: 'Admin@1234',
		role: 'admin',
	},
	{
		name: 'Manager User',
		email: 'manager@foodorder.com',
		password: 'Manager@1234',
		role: 'manager',
	},
	{
		name: 'Cashier User',
		email: 'cashier@foodorder.com',
		password: 'Cashier@1234',
		role: 'cashier',
	},
	{
		name: 'Kitchen User',
		email: 'kitchen@foodorder.com',
		password: 'Kitchen@1234',
		role: 'kitchen',
	},
];
