import Link from 'next/link';
import Image from 'next/image';
import { CallControls, SpeakerLayout } from '@stream-io/video-react-sdk';
interface Props {
	meetingName: string;
	onLeave: () => void;
}

import React from 'react';

const CallActive = ({ onLeave, meetingName }: Props) => {
	return (
		<div className="flex h-full flex-col justify-between p-4 text-white">
			<div className="flex items-center gap-4 rounded-full bg-[#101213]">
				<Link
					href={'/'}
					className="flex w-fit items-center justify-center rounded-full bg-white/10 p-1"
				>
					<Image src={'/logo.svg'} alt="logo" width={24} height={24} />
				</Link>

				<h4 className="text-base font-medium">{meetingName}</h4>
			</div>
			<SpeakerLayout />
			<div className="rounded-full bg-[#101213] px-4">
				<CallControls onLeave={onLeave} />
			</div>
		</div>
	);
};

export default CallActive;
