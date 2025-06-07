'use client';
import ErrorState from '@/components/error-state';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import React from 'react';
import CallProvider from '../components/call-provider';

interface Props {
	meetingId: string;
}
const CallView = ({ meetingId }: Props) => {
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }));

	if (data.status === 'completed') {
		return (
			<div className="flex h-screen items-center justify-center">
				<ErrorState title="Meeting has ended" description="Please try again later." />
			</div>
		);
	}
	return <CallProvider meetingId={meetingId} meetingName={data.name}></CallProvider>;
};

export default CallView;
