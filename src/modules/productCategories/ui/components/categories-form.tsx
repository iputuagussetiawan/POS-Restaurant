import React, { useRef, useState } from 'react';
import { z } from 'zod';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
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
import RichTextEditor from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { CategoriesGetOne } from '../../types';
import { categoriesInsertSchema } from '../../schema';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImageIcon, LinkIcon, UploadIcon, XIcon } from 'lucide-react';

type ImageTab = 'url' | 'file';

interface CategoriesFormProps {
	onSuccess?: () => void;
	onCancel?: () => void;
	initialValues?: CategoriesGetOne;
}

const CategoriesForm = ({ onSuccess, onCancel, initialValues }: CategoriesFormProps) => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [imageTab, setImageTab] = useState<ImageTab>('url');
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const createCategories = useMutation(
		trpc.categories.create.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.categories.getMany.queryOptions({}));
				onSuccess?.();
			},
			onError: (error) => toast.error(error.message),
		})
	);

	const updateCategories = useMutation(
		trpc.categories.update.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.categories.getMany.queryOptions({}));
				if (initialValues?.id) {
					await queryClient.invalidateQueries(
						trpc.categories.getOne.queryOptions({ id: initialValues.id })
					);
				}
				onSuccess?.();
			},
			onError: (error) => toast.error(error.message),
		})
	);

	const form = useForm<z.infer<typeof categoriesInsertSchema>>({
		resolver: zodResolver(categoriesInsertSchema),
		defaultValues: {
			name: initialValues?.name ?? '',
			description: initialValues?.description ?? '',
			imageUrl: initialValues?.imageUrl ?? '',
		},
	});

	const isEdit = !!initialValues?.id;
	const isPending = createCategories.isPending || updateCategories.isPending;
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
		reader.onload = (e) =>
			form.setValue('imageUrl', e.target?.result as string, { shouldValidate: true });
		reader.readAsDataURL(file);
	};

	const onSubmit = (values: z.infer<typeof categoriesInsertSchema>) => {
		if (isEdit) {
			updateCategories.mutate({ ...values, id: initialValues.id });
		} else {
			createCategories.mutate(values);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-5">
				{/* ── image ── */}
				<FormField
					control={form.control}
					name="imageUrl"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Category Image</FormLabel>

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

							{imageTab === 'url' && (
								<FormControl>
									<Input
										value={field.value}
										onChange={field.onChange}
										placeholder="https://example.com/image.jpg"
									/>
								</FormControl>
							)}

							{imageTab === 'file' && (
								<div
									className={cn(
										'flex cursor-pointer flex-col items-center justify-center gap-y-2 rounded-md border-2 border-dashed py-6 transition-colors',
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
										const f = e.dataTransfer.files[0];
										if (f) handleFile(f);
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
											const f = e.target.files?.[0];
											if (f) handleFile(f);
										}}
									/>
								</div>
							)}

							{imageUrl ? (
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
										<p className="text-xs font-medium">Preview</p>
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
							) : (
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

				<Separator />

				{/* ── name & description ── */}
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input {...field} placeholder="e.g. Seafood" />
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
							<FormLabel>Description</FormLabel>
							<FormControl>
								<RichTextEditor
									value={field.value ?? ''}
									onChange={field.onChange}
									placeholder="e.g. Fresh seafood dishes from the ocean"
								/>
							</FormControl>
							<FormMessage />
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
						{isEdit ? 'Save changes' : 'Create category'}
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default CategoriesForm;
