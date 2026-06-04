import ResponsiveDialog from '@/components/responsive-dialog';
import DiscountForm from './discount-form';
import { DiscountsGetOne } from '../../types';

interface UpdateDiscountDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialValues?: DiscountsGetOne;
}

const UpdateDiscountDialog = ({ open, onOpenChange, initialValues }: UpdateDiscountDialogProps) => {
	return (
		<ResponsiveDialog
			title="Edit Discount"
			description="Update discount details"
			open={open}
			onOpenChange={onOpenChange}
		>
			<DiscountForm
				onSuccess={() => onOpenChange(false)}
				onCancel={() => onOpenChange(false)}
				initialValues={initialValues}
			/>
		</ResponsiveDialog>
	);
};

export default UpdateDiscountDialog;
