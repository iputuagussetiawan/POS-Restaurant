import ResponsiveDialog from '@/components/responsive-dialog';
import React from 'react';
import MeetingForm from './meeting-form';
import { useRouter } from 'next/navigation';

interface NewMeetingDialogProp {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const NewMeetingDialog = ({ open, onOpenChange }: NewMeetingDialogProp) => {
	const router = useRouter();
	return (
		<div>
			<ResponsiveDialog
				title="New Meeting"
				description="Create a new meeting"
				open={open}
				onOpenChange={onOpenChange}
			>
				<MeetingForm
					onSuccess={(id) => {
						onOpenChange(false);
						router.push(`/meetings/${id}`);
					}}
					onCancel={() => onOpenChange(false)}
				/>
			</ResponsiveDialog>
		</div>
	);
};

export default NewMeetingDialog;
