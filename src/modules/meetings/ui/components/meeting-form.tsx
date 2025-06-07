import React, { useState } from 'react';
import { z } from 'zod';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { meetingInsertSchema } from '../../schema';
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
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MeetingGetOne } from '../../types';
import { Input } from '@/components/ui/input';

import { CommandSelect } from '@/components/command-select';
import GenerateAvatar from '@/components/generate-avatar';
import NewAgentDialog from '@/modules/agents/ui/components/new-agent-dialog';

interface MeetingFormProp {
	onSuccess?: (id?: string) => void;
	onCancel?: () => void;
	initialValues?: MeetingGetOne;
}
const MeetingForm = ({ onSuccess, onCancel, initialValues }: MeetingFormProp) => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const [agentSearch, setAgentSearch] = useState('');
	const [openNewAgentDialog, setOpenNewAgentDialog] = useState(false);
	const agents = useQuery(
		trpc.agents.getMany.queryOptions({
			pageSize: 100,
			search: agentSearch,
		})
	);

	const createMeeting = useMutation(
		trpc.meetings.create.mutationOptions({
			onSuccess: async (data) => {
				await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));

				//TODO - Invalidate free tier usage
				onSuccess?.(data.id);
			},
			onError: (error) => {
				toast.error(error.message);
				//TODO - Check if error code is "Forbidden", redirect to "/upgrade"
			},
		})
	);

	const updateMeeting = useMutation(
		trpc.meetings.update.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
				if (initialValues?.id) {
					await queryClient.invalidateQueries(
						trpc.meetings.getOne.queryOptions({
							id: initialValues.id,
						})
					);
				}
				onSuccess?.();
			},
			onError: (error) => {
				toast.error(error.message);
				//TODO - Check if error code is "Forbidden", redirect to "/upgrade"
			},
		})
	);

	const form = useForm<z.infer<typeof meetingInsertSchema>>({
		resolver: zodResolver(meetingInsertSchema),
		defaultValues: {
			name: initialValues?.name ?? '',
			agentId: initialValues?.agentId ?? '',
		},
	});

	const isEdit = !!initialValues?.id;
	const isPending = createMeeting.isPending || updateMeeting.isPending;

	const onSubmit = (values: z.infer<typeof meetingInsertSchema>) => {
		if (isEdit) {
			updateMeeting.mutate({ ...values, id: initialValues.id });
		} else {
			createMeeting.mutate(values);
		}
	};
	return (
		<>
			<NewAgentDialog open={openNewAgentDialog} onOpenChange={setOpenNewAgentDialog} />
			<Form {...form}>
				<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input {...field} placeholder="e.g. Math Consultation" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="agentId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Agent</FormLabel>
								<FormControl>
									<CommandSelect
										options={(agents.data?.items ?? []).map((agent) => ({
											id: agent.id,
											value: agent.id,
											children: (
												<div className="flex items-center gap-x-2">
													<GenerateAvatar
														className="size-6 border"
														seed={agent.name}
														variant="botttsNeutral"
													/>
													<span>{agent.name}</span>
												</div>
											),
										}))}
										onSelect={field.onChange}
										onSearch={setAgentSearch}
										value={field.value}
										placeholder="Select an agent"
									/>
								</FormControl>
								<FormDescription>
									Not Found what&apos;s your agent?{' '}
									<button
										className="text-primary hover:underline"
										type="button"
										onClick={() => setOpenNewAgentDialog(true)}
									>
										Create New Agent
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
		</>
	);
};

export default MeetingForm;
