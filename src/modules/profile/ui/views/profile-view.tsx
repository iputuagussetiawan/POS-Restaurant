'use client';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
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
import { Badge } from '@/components/ui/badge';
import GenerateAvatar from '@/components/generate-avatar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import React from 'react';

const ROLE_COLORS: Record<string, string> = {
	admin: 'bg-red-100 text-red-700 border-red-200',
	manager: 'bg-blue-100 text-blue-700 border-blue-200',
	cashier: 'bg-green-100 text-green-700 border-green-200',
	pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const formSchema = z.object({
	name: z.string().min(1, { message: 'Name is required.' }),
	image: z.string().url({ message: 'Must be a valid URL.' }).or(z.literal('')).optional(),
});

const ProfileView = () => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { data: profile } = useSuspenseQuery(trpc.profile.get.queryOptions());

	const updateProfile = useMutation(
		trpc.profile.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(trpc.profile.get.queryOptions());
				toast.success('Profile updated');
			},
			onError: (err) => toast.error(err.message),
		})
	);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: profile.name,
			image: profile.image ?? '',
		},
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		updateProfile.mutate({
			name: values.name,
			image: values.image || null,
		});
	};

	const role = profile.role ?? 'pending';

	return (
		<div className="flex flex-1 flex-col gap-y-6 px-4 py-6 md:px-8">
			<h5 className="text-xl font-medium">My Profile</h5>

			<div className="grid gap-6 md:grid-cols-3">
				{/* Avatar card */}
				<div className="flex flex-col items-center gap-4 rounded-lg border bg-white px-6 py-8">
					{profile.image ? (
						<Avatar className="size-24">
							<AvatarImage src={profile.image} alt={profile.name} />
							<AvatarFallback>{profile.name.charAt(0).toUpperCase()}</AvatarFallback>
						</Avatar>
					) : (
						<GenerateAvatar
							seed={profile.name}
							variant="initials"
							className="size-24"
						/>
					)}
					<div className="flex flex-col items-center gap-1 text-center">
						<p className="text-lg font-semibold">{profile.name}</p>
						<p className="text-sm text-muted-foreground">{profile.email}</p>
						<Badge className={`mt-1 capitalize ${ROLE_COLORS[role]}`} variant="outline">
							{role}
						</Badge>
					</div>
					<Separator />
					<div className="w-full text-sm text-muted-foreground">
						<p>
							Member since{' '}
							<span className="font-medium text-foreground">
								{new Date(profile.createdAt).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})}
							</span>
						</p>
					</div>
				</div>

				{/* Edit form */}
				<div className="rounded-lg border bg-white px-6 py-8 md:col-span-2">
					<h6 className="mb-6 text-base font-medium">Edit Profile</h6>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Full Name</FormLabel>
										<FormControl>
											<Input placeholder="John Doe" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormItem>
								<FormLabel>Email</FormLabel>
								<Input value={profile.email} disabled />
							</FormItem>

							<FormItem>
								<FormLabel>Role</FormLabel>
								<Input value={role} disabled className="capitalize" />
							</FormItem>

							<FormField
								control={form.control}
								name="image"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Profile Image URL</FormLabel>
										<FormControl>
											<Input
												placeholder="https://example.com/avatar.jpg"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex justify-end">
								<Button type="submit" disabled={updateProfile.isPending}>
									{updateProfile.isPending ? 'Saving...' : 'Save Changes'}
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</div>
		</div>
	);
};

export default ProfileView;

export const ProfileViewLoading = () => (
	<div className="flex flex-1 items-center justify-center">
		<p className="text-muted-foreground">Loading profile...</p>
	</div>
);

export const ProfileViewError = () => (
	<div className="flex flex-1 items-center justify-center">
		<p className="text-destructive">Failed to load profile.</p>
	</div>
);
