import ResponsiveDialog from '@/components/responsive-dialog';
import React from 'react';
import CategoriesForm from './categories-form';
import { CategoriesGetOne } from '../../types';

interface UpdateCategoriesDialogProp {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialValues?: CategoriesGetOne;
}

const UpdateCategoriesDialog = ({
	open,
	onOpenChange,
	initialValues,
}: UpdateCategoriesDialogProp) => {
	return (
		<div>
			<ResponsiveDialog
				title="Edit Category"
				description="Edit the category detail"
				open={open}
				onOpenChange={onOpenChange}
			>
				<CategoriesForm
					onSuccess={() => onOpenChange(false)}
					onCancel={() => onOpenChange(false)}
					initialValues={initialValues}
				/>
			</ResponsiveDialog>
		</div>
	);
};

export default UpdateCategoriesDialog;
