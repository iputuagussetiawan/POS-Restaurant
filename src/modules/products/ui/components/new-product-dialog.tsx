import ResponsiveDialog from '@/components/responsive-dialog';
import React from 'react';
import ProductForm from './product-form';

interface NewProductDialogProp {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const NewProductDialog = ({ open, onOpenChange }: NewProductDialogProp) => {
    return (
        <div>
            <ResponsiveDialog
                title="New Product"
                description="Create a new product"
                open={open}
                onOpenChange={onOpenChange}
            >
                <ProductForm
                    onSuccess={() => onOpenChange(false)}
                    onCancel={() => onOpenChange(false)}
                />
            </ResponsiveDialog>
        </div>
    );
};

export default NewProductDialog;
