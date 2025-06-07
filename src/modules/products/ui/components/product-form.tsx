import React, { useState } from 'react';
import { z } from 'zod';
import { ProductGetOne } from '../../types';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { productInsertSchema } from '../../schema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CommandSelect } from '@/components/command-select';
import GenerateAvatar from '@/components/generate-avatar';

interface ProductFormProp {
	onSuccess?: (id?: string) => void;
	onCancel?: () => void;
	initialValues?: ProductGetOne;
}
const ProductForm = ({ onSuccess, onCancel, initialValues }: ProductFormProp) => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

    const [categorySearch, setCategorySearch] = useState('');
	const [openNewAgentDialog, setOpenNewAgentDialog] = useState(false);
	const productCategories = useQuery(
		trpc.categories.getMany.queryOptions({
			pageSize: 100,
			search: categorySearch,
		})
	);

	const createProduct = useMutation(
		trpc.products.create.mutationOptions({
			onSuccess: async (data) => {
				await queryClient.invalidateQueries(trpc.products.getMany.queryOptions({}));
				onSuccess?.(data.id);
			},
			onError: (error) => {
				toast.error(error.message);
			},
		})
	);

	const updateProduct = useMutation(
		trpc.products.update.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.products.getMany.queryOptions({}));
				if (initialValues?.id) {
					await queryClient.invalidateQueries(
						trpc.products.getOne.queryOptions({
							id: initialValues.id,
						})
					);
				}
				onSuccess?.();
			},
			onError: (error) => {
				toast.error(error.message);
			},
		})
	);

	const form = useForm<z.infer<typeof productInsertSchema>>({
		resolver: zodResolver(productInsertSchema),
		defaultValues: {
			name: initialValues?.name ?? '',
			imageUrl: initialValues?.imageUrl ?? '',
			categoryId: initialValues?.categoryId ?? '',
		},
	});

	const isEdit = !!initialValues?.id;
	const isPending = createProduct.isPending || updateProduct.isPending;

	const onSubmit = (values: z.infer<typeof productInsertSchema>) => {
		if (isEdit) {
			updateProduct.mutate({ ...values, id: initialValues.id });
		} else {
			createProduct.mutate(values);
		}
	};
	return (
		<Form {...form}>
			<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input {...field} placeholder="e.g. Pizza Meat Lover" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="imageUrl"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Image Url</FormLabel>
							<FormControl>
								<Input {...field} placeholder="https://example.com/image.jpg" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="categoryId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Category Product</FormLabel>
							<FormControl>
								<CommandSelect
									options={(productCategories.data?.items ?? []).map((category) => ({
										id: category.id,
										value: category.id,
										children: (
											<div className="flex items-center gap-x-2">
												<GenerateAvatar
													className="size-6 border"
													seed={category.name}
													variant="botttsNeutral"
												/>
												<span>{category.name}</span>
											</div>
										),
									}))}
									onSelect={field.onChange}
									onSearch={setCategorySearch}
									value={field.value}
									placeholder="Select a category product..."
								/>
							</FormControl>
							<FormDescription>
								Not Found what&apos;s your agent?{' '}
								<button
									className="text-primary hover:underline"
									type="button"
									onClick={() => setOpenNewAgentDialog(true)}
								>
									Create New Category Product
								</button>
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex justify-between gap-x-2">
					{onCancel && (
						<Button
							variant={'ghost'}
							disabled={isPending}
							type="button"
							onClick={() => onCancel()}
						>
							Cancel
						</Button>
					)}

					<Button type="submit" disabled={isPending}>
						{isEdit ? 'Update' : 'Create'}
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default ProductForm;
