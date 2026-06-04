import React, { useRef, useState } from 'react';
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
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import RichTextEditor from '@/components/rich-text-editor';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { CommandSelect } from '@/components/command-select';
import Image from 'next/image';
import GenerateAvatar from '@/components/generate-avatar';
import { ImageIcon, LinkIcon, UploadIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductFormProp {
	onSuccess?: (id?: string) => void;
	onCancel?: () => void;
	initialValues?: ProductGetOne;
}

type ImageTab = 'url' | 'file';

const ProductForm = ({ onSuccess, onCancel, initialValues }: ProductFormProp) => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [categorySearch, setCategorySearch] = useState('');
	const [imageTab, setImageTab] = useState<ImageTab>('url');
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const productCategories = useQuery(
		trpc.categories.getMany.queryOptions({ pageSize: 100, search: categorySearch })
	);

	const createProduct = useMutation(
		trpc.products.create.mutationOptions({
			onSuccess: async (data) => {
				await queryClient.invalidateQueries(trpc.products.getMany.queryOptions({}));
				onSuccess?.(data.id);
			},
			onError: (error) => toast.error(error.message),
		})
	);

	const updateProduct = useMutation(
		trpc.products.update.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.products.getMany.queryOptions({}));
				if (initialValues?.id) {
					await queryClient.invalidateQueries(
						trpc.products.getOne.queryOptions({ id: initialValues.id })
					);
				}
				onSuccess?.();
			},
			onError: (error) => toast.error(error.message),
		})
	);

	const form = useForm<z.infer<typeof productInsertSchema>>({
		resolver: zodResolver(productInsertSchema),
		defaultValues: {
			name: initialValues?.name ?? '',
			imageUrl: initialValues?.imageUrl ?? '',
			categoryId: initialValues?.categoryId ?? '',
			description: initialValues?.description ?? '',
			price: initialValues?.price ? Number(initialValues.price) : 0,
			isAvailable: initialValues?.isAvailable ?? true,
			images: (initialValues?.images as string[] | null) ?? [],
		},
	});

	const isEdit = !!initialValues?.id;
	const isPending = createProduct.isPending || updateProduct.isPending;
	const imageUrl = form.watch('imageUrl');

	const handleFile = (file: File) => {
		if (!file.type.startsWith('image/')) {
			toast.error('Please select an image file.');
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			toast.error('Image must be under 5 MB.');
			return;
		}
		const reader = new FileReader();
		reader.onload = (e) => {
			form.setValue('imageUrl', e.target?.result as string, { shouldValidate: true });
		};
		reader.readAsDataURL(file);
	};

	const onSubmit = (values: z.infer<typeof productInsertSchema>) => {
		if (isEdit) {
			updateProduct.mutate({ ...values, id: initialValues.id });
		} else {
			createProduct.mutate(values);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-5">
				{/* ── image section ── */}
				<FormField
					control={form.control}
					name="imageUrl"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Product Image</FormLabel>

							{/* tab switcher */}
							<div className="flex rounded-md border bg-muted/40 p-0.5">
								{(['url', 'file'] as ImageTab[]).map((tab) => (
									<button
										key={tab}
										type="button"
										onClick={() => setImageTab(tab)}
										className={cn(
											'flex flex-1 items-center justify-center gap-x-1.5 rounded-sm py-1.5 text-xs font-medium transition-colors',
											imageTab === tab
												? 'bg-white text-foreground shadow-sm'
												: 'text-muted-foreground hover:text-foreground'
										)}
									>
										{tab === 'url' ? (
											<>
												<LinkIcon className="size-3" /> URL
											</>
										) : (
											<>
												<UploadIcon className="size-3" /> Upload file
											</>
										)}
									</button>
								))}
							</div>

							{/* url input */}
							{imageTab === 'url' && (
								<FormControl>
									<Input
										value={field.value}
										onChange={field.onChange}
										placeholder="https://example.com/image.jpg"
									/>
								</FormControl>
							)}

							{/* file drop zone */}
							{imageTab === 'file' && (
								<div
									className={cn(
										'relative flex cursor-pointer flex-col items-center justify-center gap-y-2 rounded-md border-2 border-dashed py-6 transition-colors',
										isDragging
											? 'border-primary bg-primary/5'
											: 'border-input hover:border-primary/50 hover:bg-muted/40'
									)}
									onClick={() => fileInputRef.current?.click()}
									onDragOver={(e) => {
										e.preventDefault();
										setIsDragging(true);
									}}
									onDragLeave={() => setIsDragging(false)}
									onDrop={(e) => {
										e.preventDefault();
										setIsDragging(false);
										const file = e.dataTransfer.files[0];
										if (file) handleFile(file);
									}}
								>
									<UploadIcon className="size-6 text-muted-foreground" />
									<div className="text-center">
										<p className="text-sm font-medium">Click or drag & drop</p>
										<p className="text-xs text-muted-foreground">
											PNG, JPG, WEBP — max 5 MB
										</p>
									</div>
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										className="hidden"
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) handleFile(file);
										}}
									/>
								</div>
							)}

							{/* preview */}
							{imageUrl && (
								<div className="relative mt-1 flex min-w-0 items-center gap-x-3 overflow-hidden rounded-md border bg-muted/30 p-2">
									<div className="relative size-14 shrink-0 overflow-hidden rounded-md border">
										<Image
											src={imageUrl}
											alt="preview"
											fill
											sizes="56px"
											className="object-cover"
										/>
									</div>
									<div className="flex min-w-0 flex-1 flex-col gap-y-0.5">
										<p className="text-xs font-medium text-foreground">
											Preview
										</p>
										<p className="truncate text-xs text-muted-foreground">
											{imageUrl.startsWith('data:') ? 'Local file' : imageUrl}
										</p>
									</div>
									<button
										type="button"
										onClick={() =>
											form.setValue('imageUrl', '', { shouldValidate: true })
										}
										className="shrink-0 rounded-sm p-1 text-muted-foreground hover:text-foreground"
									>
										<XIcon className="size-3.5" />
									</button>
								</div>
							)}

							{!imageUrl && (
								<div className="flex items-center justify-center gap-x-2 rounded-md border border-dashed py-4">
									<ImageIcon className="size-5 text-muted-foreground/40" />
									<p className="text-xs text-muted-foreground">
										No image selected
									</p>
								</div>
							)}

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* ── gallery images ── */}
				<FormField
					control={form.control}
					name="images"
					render={({ field }) => {
						const extraImages: string[] = field.value ?? [];
						const addImageUrl = () => {
							const url = prompt('Enter image URL:');
							if (url?.trim()) field.onChange([...extraImages, url.trim()]);
						};
						const removeImage = (index: number) => {
							field.onChange(extraImages.filter((_, i) => i !== index));
						};
						return (
							<FormItem>
								<div className="flex items-center justify-between">
									<FormLabel>
										Gallery Images{' '}
										<span className="font-normal text-muted-foreground">
											(optional)
										</span>
									</FormLabel>
									<button
										type="button"
										onClick={addImageUrl}
										className="text-xs font-medium text-primary hover:underline"
									>
										+ Add image
									</button>
								</div>
								{extraImages.length > 0 ? (
									<div className="flex flex-wrap gap-2">
										{extraImages.map((img, i) => (
											<div
												key={i}
												className="group relative size-16 overflow-hidden rounded-lg border"
											>
												<Image
													src={img}
													alt={`Gallery ${i + 1}`}
													fill
													sizes="64px"
													className="object-cover"
												/>
												<button
													type="button"
													onClick={() => removeImage(i)}
													className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
												>
													<XIcon className="size-4 text-white" />
												</button>
											</div>
										))}
									</div>
								) : (
									<div className="flex items-center gap-x-2 rounded-md border border-dashed px-3 py-3">
										<ImageIcon className="size-4 text-muted-foreground/40" />
										<p className="text-xs text-muted-foreground">
											No gallery images — click &quot;+ Add image&quot; to add
											more views
										</p>
									</div>
								)}
								<FormMessage />
							</FormItem>
						);
					}}
				/>

				<Separator />

				{/* ── basic info ── */}
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Product name</FormLabel>
							<FormControl>
								<Input {...field} placeholder="e.g. Pizza Meat Lover" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								Description{' '}
								<span className="font-normal text-muted-foreground">
									(optional)
								</span>
							</FormLabel>
							<FormControl>
								<RichTextEditor
									value={field.value ?? ''}
									onChange={field.onChange}
									placeholder="Short description visible to customers..."
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Separator />

				{/* ── price & category ── */}
				<div className="grid grid-cols-2 gap-x-4">
					<FormField
						control={form.control}
						name="price"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Price</FormLabel>
								<FormControl>
									<div className="relative">
										<span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
											$
										</span>
										<Input
											{...field}
											type="number"
											min="0"
											step="0.01"
											placeholder="0.00"
											className="pl-7"
										/>
									</div>
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
								<FormLabel>Category</FormLabel>
								<FormControl>
									<CommandSelect
										className="w-full"
										options={(productCategories.data?.items ?? []).map(
											(cat) => ({
												id: cat.id,
												value: cat.id,
												children: (
													<div className="flex items-center gap-x-2">
														{cat.imageUrl ? (
															<Image
																src={cat.imageUrl}
																alt={cat.name}
																width={16}
																height={16}
																className="size-4 rounded-sm object-cover"
															/>
														) : (
															<GenerateAvatar
																className="size-4"
																seed={cat.name}
																variant="botttsNeutral"
															/>
														)}
														<span>{cat.name}</span>
													</div>
												),
											})
										)}
										onSelect={field.onChange}
										onSearch={setCategorySearch}
										value={field.value}
										placeholder="Select..."
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<Separator />

				{/* ── availability ── */}
				<FormField
					control={form.control}
					name="isAvailable"
					render={({ field }) => (
						<FormItem className="flex items-center justify-between gap-x-4 rounded-lg border bg-muted/30 px-4 py-3">
							<div className="space-y-0.5">
								<FormLabel className="font-medium">Available</FormLabel>
								<p className="text-xs text-muted-foreground">
									Visible to customers on the menu
								</p>
							</div>
							<FormControl>
								<Switch checked={field.value} onCheckedChange={field.onChange} />
							</FormControl>
						</FormItem>
					)}
				/>

				{/* ── actions ── */}
				<div className="flex items-center justify-end gap-x-2 pt-1">
					{onCancel && (
						<Button
							variant="outline"
							type="button"
							disabled={isPending}
							onClick={onCancel}
						>
							Cancel
						</Button>
					)}
					<Button type="submit" disabled={isPending}>
						{isEdit ? 'Save changes' : 'Create product'}
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default ProductForm;
