import { redirect } from 'next/navigation';

interface Props {
	params: Promise<{ meetingId: string }>;
}

const Page = async (_props: Props) => {
	redirect('/');
};

export default Page;
