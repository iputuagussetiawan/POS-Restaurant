import ResponsiveDialog from '@/components/responsive-dialog';
import React from 'react';
import ProductForm from './product-form';
import { useRouter } from 'next/navigation';

interface NewProductDialogProp {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const NewProductDialog = ({ open, onOpenChange }: NewProductDialogProp) => {
    const router=useRouter();
    return (
        <div>
            <ResponsiveDialog
                title="New Product"
                description="Create a new product"
                open={open}
                onOpenChange={onOpenChange}
            >
                <ProductForm
                    onSuccess={(id) => {
                        onOpenChange(false)
                        router.push(`/products/${id}`)
                    }}
                    onCancel={() => onOpenChange(false)}
                />
            </ResponsiveDialog>
        </div>
    );
};

export default NewProductDialog;
