import HeaderPOS from '@/modules/pos/ui/components/header';
import FooterPOS from '@/modules/pos/ui/components/footer';
import BillView from '@/modules/bill/ui/views/bill-view';

const BillPage = () => {
	return (
		<div className="flex min-h-screen flex-col bg-muted">
			<HeaderPOS />
			<div className="flex flex-1 flex-col">
				<BillView />
			</div>
			<FooterPOS />
		</div>
	);
};

export default BillPage;
