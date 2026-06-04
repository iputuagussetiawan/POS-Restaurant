import ResponsiveDialog from '@/components/responsive-dialog';
import DiscountForm from './discount-form';

interface NewDiscountDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const NewDiscountDialog = ({ open, onOpenChange }: NewDiscountDialogProps) => {
	return (
		<ResponsiveDialog
			title="New Discount"
			description="Create a new discount code"
			open={open}
			onOpenChange={onOpenChange}
		>
			<DiscountForm
				onSuccess={() => onOpenChange(false)}
				onCancel={() => onOpenChange(false)}
			/>
		</ResponsiveDialog>
	);
};

export default NewDiscountDialog;
