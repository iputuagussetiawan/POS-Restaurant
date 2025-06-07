import React from 'react';
import { LogInIcon } from 'lucide-react';
import Link from 'next/link';
import {
	DefaultVideoPlaceholder,
	StreamVideoParticipant,
	ToggleAudioPreviewButton,
	ToggleVideoPreviewButton,
	useCallStateHooks,
	VideoPreview,
} from '@stream-io/video-react-sdk';

import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { generateAvatarUrl } from '@/lib/avatar';

import '@stream-io/video-react-sdk/dist/css/styles.css';

interface Props {
	onJoin: () => void;
}

const DisableVideoPreview = () => {
	const { data } = authClient.useSession();
	return (
		<DefaultVideoPlaceholder
			participant={
				{
					name: data?.user.name ?? '',
					image:
						data?.user.image ??
						generateAvatarUrl({
							seed: data?.user.name ?? '',
							variant: 'initials',
						}),
				} as StreamVideoParticipant
			}
		/>
	);
};

const AllowBrowserPermissions = () => {
	return <p className="text-sm">Please grant access to your camera and microphone</p>;
};
const CallLobby = ({ onJoin }: Props) => {
	const { useCameraState, useMicrophoneState } = useCallStateHooks();
	const { hasBrowserPermission: hasMicPermissions } = useMicrophoneState();
	const { hasBrowserPermission: hasCameraPermissions } = useCameraState();

	const hasBrowserMediaPermissions = hasMicPermissions && hasCameraPermissions;
	return (
		<div className="flex h-full flex-col items-center justify-center bg-radial from-sidebar-accent to-sidebar">
			<div className="flex flex-1 items-center justify-center px-8 py-4">
				<div className="flex flex-col items-center justify-center gap-y-6 rounded-lg bg-background p-10 shadow-sm">
					<div className="flex flex-col gap-y-2 text-center">
						<h6 className="text-lg font-medium">Ready to join</h6>
						<p className="text-sm">Set up your call before joining</p>
					</div>
					<VideoPreview
						DisabledVideoPreview={
							hasBrowserMediaPermissions
								? DisableVideoPreview
								: AllowBrowserPermissions
						}
					/>

					<div className="flex gap-x-2">
						<ToggleAudioPreviewButton />
						<ToggleVideoPreviewButton />
					</div>

					<div className="flex w-full justify-between gap-x-2">
						<Button variant={'ghost'} asChild>
							<Link href={'/meetings'}> Cancel</Link>
						</Button>
						<Button onClick={onJoin}>
							<LogInIcon /> Join Call
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CallLobby;
