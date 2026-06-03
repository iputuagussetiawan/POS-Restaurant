import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

interface Props {
	children: React.ReactNode;
}

const POSLayout = async ({ children }: Props) => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		redirect('/sign-in');
	}
	return <>{children}</>;
};

export default POSLayout;
