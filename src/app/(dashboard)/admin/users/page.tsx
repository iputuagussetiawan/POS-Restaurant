import { auth } from '@/lib/auth';
import UsersView from '@/modules/users/ui/views/users-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React, { Suspense } from 'react';
import { UsersViewLoading } from '@/modules/users/ui/views/users-view-loading';

const AdminUsersPage = async () => {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session || session.user.role !== 'admin') {
		redirect('/');
	}

	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(trpc.users.getAll.queryOptions({}));

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<UsersViewLoading />}>
				<UsersView />
			</Suspense>
		</HydrationBoundary>
	);
};

export default AdminUsersPage;
