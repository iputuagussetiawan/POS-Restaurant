import React from 'react';
import { LogInIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const CallEnded = () => {
	return (
		<div className="flex h-full flex-col items-center justify-center bg-radial from-sidebar-accent to-sidebar">
			<div className="flex flex-1 items-center justify-center px-8 py-4">
				<div className="flex flex-col items-center justify-center gap-y-6 rounded-lg bg-background p-10 shadow-sm">
					<div className="flex flex-col gap-y-2 text-center">
						<h6 className="text-lg font-medium">You Have Ended the call</h6>
						<p className="text-sm">Su,,ary will appear in a few seconds</p>
					</div>
					<Button asChild variant={'ghost'}>
						<Link href={'/meetings'}>
							<LogInIcon />
							Back To Meetings
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CallEnded;
