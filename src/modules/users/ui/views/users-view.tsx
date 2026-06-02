'use client';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import React, { Suspense } from 'react';
import LoadingState from '@/components/loading-state';

type Role = 'admin' | 'manager' | 'cashier' | 'pending';

const ROLES: Role[] = ['admin', 'manager', 'cashier', 'pending'];

const ROLE_COLORS: Record<Role, string> = {
	admin: 'bg-red-100 text-red-700',
	manager: 'bg-blue-100 text-blue-700',
	cashier: 'bg-green-100 text-green-700',
	pending: 'bg-yellow-100 text-yellow-700',
};

const UsersTable = () => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { data: users } = useSuspenseQuery(trpc.users.getAll.queryOptions());

	const setRole = useMutation(
		trpc.users.setRole.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(trpc.users.getAll.queryOptions());
				toast.success('Role updated');
			},
			onError: (err) => toast.error(err.message),
		})
	);

	return (
		<div className="overflow-hidden rounded-lg border bg-white">
			<table className="w-full text-sm">
				<thead className="border-b bg-muted/40 text-left">
					<tr>
						<th className="px-4 py-3 font-medium">Name</th>
						<th className="px-4 py-3 font-medium">Email</th>
						<th className="px-4 py-3 font-medium">Role</th>
						<th className="px-4 py-3 font-medium">Joined</th>
					</tr>
				</thead>
				<tbody>
					{users.map((u) => {
						const currentRole = (u.role ?? 'pending') as Role;
						return (
							<tr key={u.id} className="border-b last:border-0 hover:bg-muted/20">
								<td className="px-4 py-3 font-medium">{u.name}</td>
								<td className="px-4 py-3 text-muted-foreground">{u.email}</td>
								<td className="px-4 py-3">
									<Select
										value={currentRole}
										onValueChange={(role) =>
											setRole.mutate({ userId: u.id, role: role as Role })
										}
									>
										<SelectTrigger className="h-8 w-36">
											<SelectValue>
												<Badge
													className={`capitalize ${ROLE_COLORS[currentRole]}`}
													variant="outline"
												>
													{currentRole}
												</Badge>
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											{ROLES.map((r) => (
												<SelectItem key={r} value={r}>
													<span className="capitalize">{r}</span>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									{new Date(u.createdAt).toLocaleDateString()}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

const UsersView = () => {
	return (
		<div className="flex flex-1 flex-col gap-y-4 px-4 py-4 md:px-8">
			<div className="flex items-center justify-between">
				<h5 className="text-xl font-medium">User Management</h5>
			</div>
			<Suspense
				fallback={<LoadingState title="Loading users" description="Please wait..." />}
			>
				<UsersTable />
			</Suspense>
		</div>
	);
};

export default UsersView;
