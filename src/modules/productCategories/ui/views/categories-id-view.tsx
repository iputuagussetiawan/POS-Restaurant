'use client';

import ErrorState from '@/components/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UseConfirm } from '@/hooks/use-confirm';
import UpdateCategoriesDialog from '../components/update-categories-dialog';
import CategoriesIdViewHeader from '../components/categories-id-view-header';
import { CategoriesIdBody } from '../components/categories-id-body';

interface Props {
	categoryId: string;
}

const CategoriesIdView = ({ categoryId }: Props) => {
	const [updateOpen, setUpdateOpen] = useState(false);
	const router = useRouter();
	const queryClient = useQueryClient();
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(trpc.categories.getOne.queryOptions({ id: categoryId }));

	const removeCategory = useMutation(
		trpc.categories.remove.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.categories.getMany.queryOptions({}));
				router.push('/admin/categories');
			},
			onError: (e) => toast.error(e.message),
		})
	);

	const [RemoveConfirmation, confirmRemove] = UseConfirm(
		'Delete category?',
		`"${data.name}" and all its products will be permanently removed.`
	);

	const handleRemove = async () => {
		const ok = await confirmRemove();
		if (!ok) return;
		await removeCategory.mutateAsync({ id: categoryId });
	};

	return (
		<>
			<RemoveConfirmation />
			<UpdateCategoriesDialog
				open={updateOpen}
				onOpenChange={setUpdateOpen}
				initialValues={data}
			/>
			<div className="flex flex-col">
				<div className="border-b bg-background px-4 py-4 md:px-8">
					<CategoriesIdViewHeader
						categoryId={categoryId}
						categoryName={data.name}
						onEdit={() => setUpdateOpen(true)}
						onRemove={handleRemove}
					/>
				</div>
				<CategoriesIdBody
					data={data}
					isRemoving={removeCategory.isPending}
					onEdit={() => setUpdateOpen(true)}
					onRemove={handleRemove}
				/>
			</div>
		</>
	);
};

export default CategoriesIdView;

export const CategoriesIdViewLoading = () => (
	<div className="flex flex-col">
		<div className="border-b bg-background px-4 py-4 md:px-8">
			<Skeleton className="h-6 w-64" />
		</div>
		<div className="px-4 py-6 md:px-8">
			<div className="grid gap-8 lg:grid-cols-12">
				<div className="lg:col-span-5">
					<Skeleton className="aspect-square w-full rounded-xl" />
				</div>
				<div className="flex flex-col gap-y-5 lg:col-span-7">
					<Skeleton className="h-8 w-1/2" />
					<Skeleton className="h-px w-full" />
					<div className="flex flex-col gap-y-2">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-5/6" />
					</div>
					<Skeleton className="h-px w-full" />
					<div className="grid grid-cols-2 gap-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<Skeleton key={i} className="h-12 rounded-md" />
						))}
					</div>
					<div className="flex gap-x-3">
						<Skeleton className="h-9 w-32 rounded-md" />
						<Skeleton className="h-9 w-24 rounded-md" />
					</div>
				</div>
			</div>
		</div>
	</div>
);

export const CategoriesIdViewError = () => (
	<ErrorState title="Error Loading Category" description="Please try again later." />
);
