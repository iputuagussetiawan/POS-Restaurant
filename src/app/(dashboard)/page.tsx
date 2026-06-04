import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const DashboardRootPage = () => {
	redirect('/admin');
};

export default DashboardRootPage;
