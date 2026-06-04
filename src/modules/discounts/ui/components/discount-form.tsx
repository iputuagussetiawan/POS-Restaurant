'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Switch } from '@/components/ui/switch';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { discountInsertSchema } from '../../schema';
import { DiscountsGetOne } from '../../types';

interface DiscountFormProps {
	onSuccess?: () => void;
	onCancel?: () => void;
	initialValues?: DiscountsGetOne;
}

const DiscountForm = ({ onSuccess, onCancel, initialValues }: DiscountFormProps) => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const create = useMutation(
		trpc.discounts.create.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.discounts.getMany.queryOptions({}));
				toast.success('Discount created.');
				onSuccess?.();
			},
			onError: (e) => toast.error(e.message),
		})
	);

	const update = useMutation(
		trpc.discounts.update.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.discounts.getMany.queryOptions({}));
				if (initialValues?.id) {
					await queryClient.invalidateQueries(
						trpc.discounts.getOne.queryOptions({ id: initialValues.id })
					);
				}
				toast.success('Discount updated.');
				onSuccess?.();
			},
			onError: (e) => toast.error(e.message),
		})
	);

	const form = useForm<z.infer<typeof discountInsertSchema>>({
		resolver: zodResolver(discountInsertSchema),
		defaultValues: {
			name: initialValues?.name ?? '',
			code: initialValues?.code ?? '',
			type: initialValues?.type ?? 'percentage',
			value: initialValues?.value ? Number(initialValues.value) : 0,
			minOrderAmount: initialValues?.minOrderAmount
				? Number(initialValues.minOrderAmount)
				: null,
			maxUses: initialValues?.maxUses ?? null,
			isActive: initialValues?.isActive ?? true,
			expiresAt: initialValues?.expiresAt
				? new Date(initialValues.expiresAt).toISOString().split('T')[0]
				: null,
		},
	});

	const isEdit = !!initialValues?.id;
	const isPending = create.isPending || update.isPending;
	const discountType = form.watch('type');

	const onSubmit = (values: z.infer<typeof discountInsertSchema>) => {
		if (isEdit) {
			update.mutate({ ...values, id: initialValues.id });
		} else {
			create.mutate(values);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-5">
				{/* Name */}
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input {...field} placeholder="e.g. Summer Sale" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Code */}
				<FormField
					control={form.control}
					name="code"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Code</FormLabel>
							<FormControl>
								<Input
									{...field}
									placeholder="e.g. SUMMER20"
									onChange={(e) =>
										field.onChange(
											e.target.value.toUpperCase().replace(/\s/g, '')
										)
									}
									className="font-mono uppercase"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Separator />

				{/* Type + Value */}
				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="type"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Type</FormLabel>
								<Select value={field.value} onValueChange={field.onChange}>
									<FormControl>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="percentage">Percentage (%)</SelectItem>
										<SelectItem value="fixed">Fixed amount</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="value"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									{discountType === 'percentage'
										? 'Discount (%)'
										: 'Discount amount'}
								</FormLabel>
								<FormControl>
									<Input
										{...field}
										type="number"
										min={0}
										max={discountType === 'percentage' ? 100 : undefined}
										step="0.01"
										placeholder={discountType === 'percentage' ? '10' : '5000'}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<Separator />

				{/* Min order + Max uses */}
				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="minOrderAmount"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Min order amount</FormLabel>
								<FormControl>
									<Input
										type="number"
										min={0}
										step="0.01"
										placeholder="0 (no minimum)"
										value={field.value ?? ''}
										onChange={(e) =>
											field.onChange(
												e.target.value === ''
													? null
													: Number(e.target.value)
											)
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="maxUses"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Max uses</FormLabel>
								<FormControl>
									<Input
										type="number"
										min={1}
										placeholder="Unlimited"
										value={field.value ?? ''}
										onChange={(e) =>
											field.onChange(
												e.target.value === ''
													? null
													: Number(e.target.value)
											)
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{/* Expiry */}
				<FormField
					control={form.control}
					name="expiresAt"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Expires at</FormLabel>
							<FormControl>
								<Input
									type="date"
									value={field.value ?? ''}
									onChange={(e) =>
										field.onChange(
											e.target.value === '' ? null : e.target.value
										)
									}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Active toggle */}
				<FormField
					control={form.control}
					name="isActive"
					render={({ field }) => (
						<FormItem className="flex items-center justify-between rounded-lg border p-3">
							<div>
								<FormLabel className="text-sm font-medium">Active</FormLabel>
								<p className="text-xs text-muted-foreground">
									Inactive discounts cannot be applied at checkout.
								</p>
							</div>
							<FormControl>
								<Switch checked={field.value} onCheckedChange={field.onChange} />
							</FormControl>
						</FormItem>
					)}
				/>

				{/* Actions */}
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
						{isEdit ? 'Save changes' : 'Create discount'}
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default DiscountForm;
