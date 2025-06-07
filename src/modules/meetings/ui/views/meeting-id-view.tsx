'use client';
import ErrorState from '@/components/error-state';
import LoadingState from '@/components/loading-state';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import MeetingIdViewHeader from '../components/meeting-id-view-header';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UseConfirm } from '@/hooks/use-confirm';
import UpdateMeetingDialog from '../components/update-meeting-dialog';
import UpcomingState from '../components/upcoming-state';
import ActiveState from '../components/active-state';
import CancelledState from '../components/cancel-state';
import ProcessingState from '../components/processing-state';

interface Props {
	meetingId: string;
}
const MeetingIdView = ({ meetingId }: Props) => {
	const trpc = useTRPC();
	const router = useRouter();
	const queryClient = useQueryClient();

	const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState(false);

	const [RemoveConfirmation, confirmRemove] = UseConfirm(
		'Are you sure?',
		'The following action will remove this meeting.'
	);
	const { data } = useSuspenseQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }));
	const removeMeeting = useMutation(
		trpc.meetings.remove.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
				//TODO - Invalidate free tier usage
				router.push('/meetings');
			},
			onError: (error) => {
				toast.error(error.message);
			},
		})
	);

	const handleRemoveMeeting = async () => {
		const ok = await confirmRemove();
		if (!ok) return;
		await removeMeeting.mutateAsync({ id: meetingId });
	};

	const isActive = data.status === 'active';
	const isUpcoming = data.status === 'upcoming';
	const isCancelled = data.status === 'cancelled';
	const isCompleted = data.status === 'completed';
	const isProcessing = data.status === 'processing';
	return (
		<>
			<RemoveConfirmation />
			<UpdateMeetingDialog
				open={updateMeetingDialogOpen}
				onOpenChange={setUpdateMeetingDialogOpen}
				initialValues={data}
			/>
			<div className="flex flex-1 flex-col gap-y-4 px-4 py-4 md:px-8">
				<MeetingIdViewHeader
					meetingId={data.id}
					meetingName={data.name}
					onEdit={() => setUpdateMeetingDialogOpen(true)}
					onRemove={handleRemoveMeeting}
				/>
				{isActive && <ActiveState meetingId={meetingId} />}
				{isCancelled && <CancelledState />}
				{isProcessing && <ProcessingState />}
				{isCompleted && <div className="text-muted-foreground">Completed</div>}
				{isUpcoming && (
					<UpcomingState
						meetingId={meetingId}
						onCancelMeeting={() => {}}
						isCancelling={false}
					/>
				)}
			</div>
		</>
	);
};

export default MeetingIdView;

export const MeetingIdViewLoading = () => {
	return <LoadingState title="Loading Meeting" description="Please wait..." />;
};

export const MeetingIdViewError = () => {
	return <ErrorState title="Error Loading Meeting" description="Please try again later." />;
};
