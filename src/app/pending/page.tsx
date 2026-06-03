'use client';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ClockIcon } from 'lucide-react';

const PendingPage = () => {
	const router = useRouter();

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: { onSuccess: () => router.push('/sign-in') },
		});
	};

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6">
			<div className="flex flex-col items-center gap-4 text-center">
				<div className="flex size-16 items-center justify-center rounded-full bg-orange-100">
					<ClockIcon className="size-8 text-orange-500" />
				</div>
				<h1 className="text-2xl font-bold">Account Pending Approval</h1>
				<p className="max-w-sm text-muted-foreground">
					Your account has been created but is waiting for an admin to assign your role.
					Please contact your administrator.
				</p>
				<Button variant="outline" onClick={handleSignOut}>
					Sign Out
				</Button>
			</div>
		</div>
	);
};

export default PendingPage;
