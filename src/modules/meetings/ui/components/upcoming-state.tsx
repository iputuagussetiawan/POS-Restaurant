import EmptyState from '@/components/empty-state';
import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { VideoIcon, BanIcon } from 'lucide-react';

interface Props {
	meetingId: string;
	onCancelMeeting: () => void;
	isCancelling: boolean;
}

const UpcomingState = ({ meetingId, onCancelMeeting, isCancelling }: Props) => {
	return (
		<div className="flex flex-col items-center justify-center gap-y-8 rounded-lg bg-white px-4 py-5">
			<EmptyState
				image="/upcoming.svg"
				title="Not started yet"
				description="Once you start a meeting, it will appear here."
			/>

			<div className="flex w-full flex-col-reverse items-center gap-2 lg:flex-row lg:justify-center">
				<Button
					variant={'secondary'}
					className="w-full lg:w-auto"
					onClick={onCancelMeeting}
					disabled={isCancelling}
				>
					<BanIcon />
					Cancel Meeting
				</Button>
				<Button disabled={isCancelling} asChild className="w-full lg:w-auto">
					<Link href={`/call/${meetingId}`}>
						<VideoIcon />
						Start Meeting
					</Link>
				</Button>
			</div>
		</div>
	);
};

export default UpcomingState;
