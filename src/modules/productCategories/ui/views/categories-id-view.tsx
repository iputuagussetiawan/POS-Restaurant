'use client';

import ErrorState from '@/components/error-state';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Button } from '@/components/ui/button';
import { CalendarIcon, HashIcon, PencilIcon, TrashIcon } from 'lucide-react';

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
				router.push('/categories');
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
				{/* breadcrumb bar */}
				<div className="border-b bg-background px-4 py-4 md:px-8">
					<CategoriesIdViewHeader
						categoryId={categoryId}
						categoryName={data.name}
						onEdit={() => setUpdateOpen(true)}
						onRemove={handleRemove}
					/>
				</div>

				{/* body */}
				<div className="px-4 py-6 md:px-8">
					<div className="grid gap-8 lg:grid-cols-12">
						{/* image col */}
						<div className="lg:col-span-5">
							<div className="overflow-hidden rounded-xl border bg-white shadow-sm">
								<div className="relative aspect-square w-full">
									<Image
										src={data.imageUrl}
										alt={data.name}
										fill
										sizes="(max-width: 1024px) 100vw, 40vw"
										className="object-cover"
										priority
									/>
								</div>
							</div>
						</div>

						{/* info col */}
						<div className="flex flex-col gap-y-6 lg:col-span-7">
							{/* name */}
							<div>
								<h1 className="text-2xl leading-tight font-bold tracking-tight capitalize md:text-3xl">
									{data.name}
								</h1>
							</div>

							<Separator />

							{/* description */}
							{data.description ? (
								<div>
									<p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
										Description
									</p>
									<p className="text-base leading-relaxed text-foreground/80">
										{data.description}
									</p>
								</div>
							) : (
								<p className="text-sm text-muted-foreground/50 italic">
									No description provided.
								</p>
							)}

							<Separator />

							{/* meta */}
							<dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
								<div>
									<dt className="mb-1 flex items-center gap-x-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
										<HashIcon className="size-3" /> Slug
									</dt>
									<dd className="inline-block rounded-md bg-muted px-2 py-1 font-mono text-sm">
										{data.slug}
									</dd>
								</div>

								<div>
									<dt className="mb-1 flex items-center gap-x-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
										<CalendarIcon className="size-3" /> Created
									</dt>
									<dd className="text-sm">
										{new Date(data.createdAt).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
										})}
									</dd>
								</div>

								<div>
									<dt className="mb-1 flex items-center gap-x-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
										<CalendarIcon className="size-3" /> Last updated
									</dt>
									<dd className="text-sm">
										{new Date(data.updatedAt).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
										})}
									</dd>
								</div>
							</dl>

							<Separator />

							{/* actions */}
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
								<Button onClick={() => setUpdateOpen(true)} className="gap-x-2">
									<PencilIcon className="size-4" /> Edit category
								</Button>
								<Button
									variant="outline"
									onClick={handleRemove}
									disabled={removeCategory.isPending}
									className="w-full gap-x-2 text-destructive hover:text-destructive sm:w-auto"
								>
									<TrashIcon className="size-4" /> Delete
								</Button>
							</div>
						</div>
					</div>
				</div>
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
