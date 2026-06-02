'use client';

import ErrorState from '@/components/error-state';
import LoadingState from '@/components/loading-state';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UseConfirm } from '@/hooks/use-confirm';
import UpdateCategoriesDialog from '../components/update-categories-dialog';
import CategoriesIdViewHeader from '../components/categories-id-view-header';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, HashIcon } from 'lucide-react';

interface Props {
	categoryId: string;
}

const CategoriesIdView = ({ categoryId }: Props) => {
	const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
	const router = useRouter();
	const queryClient = useQueryClient();
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(trpc.categories.getOne.queryOptions({ id: categoryId }));

	const removeCategory = useMutation(
		trpc.categories.remove.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.categories.getMany.queryOptions({}));
				router.push('/categories');
			},
			onError: (error) => toast.error(error.message),
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
				open={updateDialogOpen}
				onOpenChange={setUpdateDialogOpen}
				initialValues={data}
			/>

			<div className="flex flex-col gap-y-4 px-4 py-4 md:px-8">
				<CategoriesIdViewHeader
					categoryId={categoryId}
					categoryName={data.name}
					onEdit={() => setUpdateDialogOpen(true)}
					onRemove={handleRemove}
				/>

				<div className="grid gap-4 lg:grid-cols-3">
					{/* image */}
					<div className="overflow-hidden rounded-xl border bg-white">
						<div className="relative aspect-square w-full">
							<Image
								src={data.imageUrl}
								alt={data.name}
								fill
								sizes="(max-width: 1024px) 100vw, 33vw"
								className="object-cover"
							/>
						</div>
					</div>

					{/* details */}
					<div className="flex flex-col gap-y-4 lg:col-span-2">
						<div className="rounded-xl border bg-white px-6 py-5">
							<h2 className="text-2xl font-semibold capitalize">{data.name}</h2>
							{data.description && (
								<p className="mt-1 text-sm text-muted-foreground">
									{data.description}
								</p>
							)}

							<Separator className="my-5" />

							<dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
								<div className="flex flex-col gap-y-1">
									<dt className="flex items-center gap-x-1.5 text-xs font-medium text-muted-foreground">
										<HashIcon className="size-3.5" /> Slug
									</dt>
									<dd className="font-mono text-sm">{data.slug}</dd>
								</div>

								<div className="flex flex-col gap-y-1">
									<dt className="flex items-center gap-x-1.5 text-xs font-medium text-muted-foreground">
										<CalendarIcon className="size-3.5" /> Created
									</dt>
									<dd className="text-sm">
										{new Date(data.createdAt).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
										})}
									</dd>
								</div>
							</dl>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default CategoriesIdView;

export const CategoriesIdViewLoading = () => (
	<LoadingState title="Loading Category" description="Please wait..." />
);

export const CategoriesIdViewError = () => (
	<ErrorState title="Error Loading Category" description="Please try again later." />
);
