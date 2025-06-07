import EmptyState from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { VideoIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface Props {
	meetingId: string;
}

const ActiveState = ({ meetingId }: Props) => {
	return (
		<div className="flex flex-col items-center justify-center gap-y-8 rounded-lg bg-white px-4 py-5">
			<EmptyState
				image="/upcoming.svg"
				title="Meeting Is Active"
				description="Meeting will end once all participants left"
			/>
			<div className="flex w-full flex-col-reverse items-center gap-2 lg:flex-row lg:justify-center">
				<Button asChild className="w-full lg:w-auto">
					<Link href={`/call/${meetingId}`}>
						<VideoIcon />
						Join Meeting
					</Link>
				</Button>
			</div>
		</div>
	);
};

export default ActiveState;
