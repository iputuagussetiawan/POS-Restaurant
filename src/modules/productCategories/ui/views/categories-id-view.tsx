'use client';
import ErrorState from '@/components/error-state';
import LoadingState from '@/components/loading-state';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import GenerateAvatar from '@/components/generate-avatar';
import { Badge } from '@/components/ui/badge';
import { VideoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UseConfirm } from '@/hooks/use-confirm';
import UpdateAgentDialog from '../components/update-categories-dialog';
import CategoriesIdViewHeader from '../components/categories-id-view-header';

interface Props {
	categoryId: string;
}

const CategoriesIdView = ({ categoryId }: Props) => {
	const [updateCategoriesDialogOpen, setUpdateCategoriesDialogOpen] = useState(false);
	const router = useRouter();
	const queryClient = useQueryClient();
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(trpc.categories.getOne.queryOptions({ id: categoryId }));

	const removeAgent = useMutation(
		trpc.agents.remove.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
				//TODO - Invalidate free tier usage

				router.push('/agents');
			},
			onError: (error) => {
				toast.error(error.message);
			},
		})
	);

	const [RemoveConfirmation, confirmRemove] = UseConfirm(
		'Are you sure?',
		`The following action will remove associated product.`
	);

	const handleRemoveAgent = async () => {
		const ok = await confirmRemove();
		if (!ok) return;
		await removeAgent.mutateAsync({ id: categoryId });
	};
	return (
		<>
			<RemoveConfirmation />
			<UpdateAgentDialog
				open={updateCategoriesDialogOpen}
				onOpenChange={setUpdateCategoriesDialogOpen}
				initialValues={data}
			/>
			<div className="flex flex-1 flex-col gap-y-4 px-4 py-4 md:px-8">
				<CategoriesIdViewHeader
					categoryId={categoryId}
					categoryName={data.name}
					onEdit={() => setUpdateCategoriesDialogOpen(true)}
					onRemove={handleRemoveAgent}
				/>
				<div className="rounded-lg border bg-white">
					<div className="col-span-5 flex flex-col gap-y-5 px-4 py-5">
						<div className="flex items-center gap-x-3">
							<GenerateAvatar
								variant="botttsNeutral"
								seed={data.name}
								className="size-10"
							/>
							<h2 className="text-2xl font-medium">{data.name}</h2>
						</div>
						
						<div className="flex flex-col gap-y-4">
							<p className="text-lg font-medium">Description</p>
							<p className="text-neutral-800">{data.description}</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default CategoriesIdView;

export const CategoriesIdViewLoading = () => {
	return <LoadingState title="Loading Category" description="Please wait..." />;
};

export const CategoriesIdViewError = () => {
	return <ErrorState title="Error Loading Categories" description="Please try again later." />;
};
