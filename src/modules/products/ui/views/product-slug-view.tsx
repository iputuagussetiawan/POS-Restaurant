'use client';

import ErrorState from '@/components/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient, useSuspenseQuery, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UseConfirm } from '@/hooks/use-confirm';
import UpdateProductDialog from '../components/update-product-dialog';
import { ChevronRightIcon, MoreVerticalIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { ProductDetailBody } from '../components/product-detail-body';

interface Props {
	slug: string;
}

const ProductSlugView = ({ slug }: Props) => {
	const [updateOpen, setUpdateOpen] = useState(false);
	const router = useRouter();
	const queryClient = useQueryClient();
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(trpc.products.getBySlug.queryOptions({ slug }));
	const { data: company } = useQuery(trpc.company.get.queryOptions());
	const taxRate = Number(company?.taxRate ?? 0);
	const serviceRate = Number(company?.serviceRate ?? 0);

	const removeProduct = useMutation(
		trpc.products.remove.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.products.getMany.queryOptions({}));
				router.push('/admin/products');
			},
			onError: (e) => toast.error(e.message),
		})
	);

	const [RemoveConfirmation, confirmRemove] = UseConfirm(
		'Delete product?',
		`"${data.name}" will be permanently removed.`
	);

	const handleRemove = async () => {
		const ok = await confirmRemove();
		if (!ok) return;
		await removeProduct.mutateAsync({ id: data.id });
	};

	return (
		<>
			<RemoveConfirmation />
			<UpdateProductDialog
				open={updateOpen}
				onOpenChange={setUpdateOpen}
				initialValues={data}
			/>
			<div className="flex flex-col">
				<div className="border-b bg-background px-4 py-4 md:px-8">
					<div className="flex items-center justify-between">
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink
										asChild
										className="text-sm font-medium text-muted-foreground"
									>
										<Link href="/admin/products">My Products</Link>
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="[&>svg:size-4] text-sm font-medium text-foreground">
									<ChevronRightIcon />
								</BreadcrumbSeparator>
								<BreadcrumbItem>
									<BreadcrumbLink
										asChild
										className="text-sm font-medium text-foreground"
									>
										<Link href={`/admin/products/${slug}`}>{data.name}</Link>
									</BreadcrumbLink>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm">
									<MoreVerticalIcon className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => setUpdateOpen(true)}>
									<PencilIcon className="mr-2 h-4 w-4" /> Edit
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleRemove}>
									<TrashIcon className="mr-2 h-4 w-4" /> Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
				<ProductDetailBody
					data={data}
					taxRate={taxRate}
					serviceRate={serviceRate}
					isRemoving={removeProduct.isPending}
					onEdit={() => setUpdateOpen(true)}
					onRemove={handleRemove}
				/>
			</div>
		</>
	);
};

export default ProductSlugView;

export const ProductSlugViewLoading = () => (
	<div className="flex flex-col">
		<div className="border-b bg-background px-4 py-4 md:px-8">
			<Skeleton className="h-6 w-64" />
		</div>
		<div className="px-4 py-6 md:px-8">
			<div className="grid gap-8 lg:grid-cols-12">
				<div className="flex flex-col gap-y-2 lg:col-span-5">
					<Skeleton className="aspect-square w-full rounded-xl" />
					<div className="flex flex-wrap gap-2">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={i} className="size-16 rounded-lg" />
						))}
					</div>
				</div>
				<div className="flex flex-col gap-y-5 lg:col-span-7">
					<div className="flex flex-col gap-y-2">
						<Skeleton className="h-8 w-3/4" />
						<Skeleton className="h-4 w-24" />
					</div>
					<Skeleton className="h-10 w-32" />
					<Skeleton className="h-px w-full" />
					<div className="flex flex-col gap-y-2">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-5/6" />
						<Skeleton className="h-4 w-4/6" />
					</div>
					<Skeleton className="h-px w-full" />
					<div className="grid grid-cols-2 gap-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={i} className="h-12 rounded-md" />
						))}
					</div>
				</div>
			</div>
		</div>
	</div>
);

export const ProductSlugViewError = () => (
	<ErrorState
		title="Product Not Found"
		description="This product does not exist or has been removed."
	/>
);
