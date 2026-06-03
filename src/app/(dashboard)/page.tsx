import { redirect } from 'next/navigation';

const DashboardRootPage = () => {
	redirect('/admin');
};

export default DashboardRootPage;
