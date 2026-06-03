import ResponsiveDialog from '@/components/responsive-dialog';
import React from 'react';
import ProductForm from './product-form';
import { ProductGetOne } from '../../types';

interface UpdateProductDialogProp {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialValues?: ProductGetOne;
}

const UpdateProductDialog = ({ open, onOpenChange, initialValues }: UpdateProductDialogProp) => {
	return (
		<div>
			<ResponsiveDialog
				title="Edit Product"
				description="Edit the product detail"
				open={open}
				onOpenChange={onOpenChange}
			>
				<ProductForm
					onSuccess={() => onOpenChange(false)}
					onCancel={() => onOpenChange(false)}
					initialValues={initialValues}
				/>
			</ResponsiveDialog>
		</div>
	);
};

export default UpdateProductDialog;
