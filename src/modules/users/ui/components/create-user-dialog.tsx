'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EyeIcon, EyeOffIcon, UserPlusIcon } from 'lucide-react';

const schema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email'),
	password: z.string().min(8, 'Minimum 8 characters'),
	role: z.enum(['admin', 'manager', 'cashier', 'kitchen', 'pending']),
});

const ROLES = [
	{ value: 'admin', label: 'Admin', color: 'text-red-600' },
	{ value: 'manager', label: 'Manager', color: 'text-blue-600' },
	{ value: 'cashier', label: 'Cashier', color: 'text-green-600' },
	{ value: 'kitchen', label: 'Kitchen', color: 'text-orange-600' },
	{ value: 'pending', label: 'Pending', color: 'text-yellow-600' },
] as const;

interface Props {
	open: boolean;
	onOpenChange: (v: boolean) => void;
}

const CreateUserDialog = ({ open, onOpenChange }: Props) => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
			role: 'pending',
		},
	});

	const create = useMutation(
		trpc.users.create.mutationOptions({
			onSuccess: async (data) => {
				await queryClient.invalidateQueries({ queryKey: trpc.users.getAll.queryKey() });
				toast.success(`User "${data.name}" created successfully.`);
				form.reset();
				onOpenChange(false);
			},
			onError: (e) => toast.error(e.message),
		})
	);

	const onSubmit = (values: z.infer<typeof schema>) => {
		create.mutate(values);
	};

	const handleClose = (v: boolean) => {
		if (!v) form.reset();
		onOpenChange(v);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700">
							<UserPlusIcon className="h-5 w-5 text-white" />
						</div>
						<div>
							<DialogTitle className="text-base font-semibold">
								Create User
							</DialogTitle>
							<p className="text-xs text-muted-foreground">
								Add a new staff account to the system
							</p>
						</div>
					</div>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-col gap-4 pt-2"
					>
						{/* Name */}
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name</FormLabel>
									<FormControl>
										<Input {...field} placeholder="e.g. John Doe" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Email */}
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="email"
											placeholder="john@example.com"
											autoComplete="off"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Password */}
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												{...field}
												type={showPassword ? 'text' : 'password'}
												placeholder="Min. 8 characters"
												autoComplete="new-password"
												className="pr-9"
											/>
											<button
												type="button"
												onClick={() => setShowPassword((v) => !v)}
												className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
											>
												{showPassword ? (
													<EyeOffIcon className="h-4 w-4" />
												) : (
													<EyeIcon className="h-4 w-4" />
												)}
											</button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Role */}
						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Role</FormLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{ROLES.map((r) => (
												<SelectItem key={r.value} value={r.value}>
													<span className={r.color}>{r.label}</span>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Actions */}
						<div className="flex justify-end gap-2 pt-2">
							<Button
								type="button"
								variant="outline"
								disabled={create.isPending}
								onClick={() => handleClose(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={create.isPending}
								className="bg-green-700 hover:bg-green-800"
							>
								{create.isPending ? 'Creating…' : 'Create user'}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default CreateUserDialog;
