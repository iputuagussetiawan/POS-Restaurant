import ProfileView, {
	ProfileViewError,
	ProfileViewLoading,
} from '@/modules/profile/ui/views/profile-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const dynamic = 'force-dynamic';

const ProfilePage = async () => {
	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(trpc.profile.get.queryOptions());

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<ProfileViewLoading />}>
				<ErrorBoundary fallback={<ProfileViewError />}>
					<ProfileView />
				</ErrorBoundary>
			</Suspense>
		</HydrationBoundary>
	);
};

export default ProfilePage;
