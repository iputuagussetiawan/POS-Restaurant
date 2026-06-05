import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ProductSlugView, {
	ProductSlugViewError,
	ProductSlugViewLoading,
} from '@/modules/products/ui/views/product-slug-view';

interface Props {
	params: Promise<{ slug: string }>;
}

const ProductSlugPage = async ({ params }: Props) => {
	const { slug } = await params;

	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect('/sign-in');

	const queryClient = getQueryClient();

	try {
		await queryClient.fetchQuery(trpc.products.getBySlug.queryOptions({ slug }));
	} catch {
		notFound();
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ErrorBoundary fallback={<ProductSlugViewError />}>
				<Suspense fallback={<ProductSlugViewLoading />}>
					<ProductSlugView slug={slug} />
				</Suspense>
			</ErrorBoundary>
		</HydrationBoundary>
	);
};

export default ProductSlugPage;
