import ResponsiveDialog from '@/components/responsive-dialog';
import React from 'react';
import CategoriesForm from './categories-form';

interface NewAgentDialogProp {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const NewAgentDialog = ({ open, onOpenChange }: NewAgentDialogProp) => {
    return (
        <div>
            <ResponsiveDialog
                title="New Categories"
                description="Create a new categories"
                open={open}
                onOpenChange={onOpenChange}
            >
                <CategoriesForm
                    onSuccess={() => onOpenChange(false)}
                    onCancel={() => onOpenChange(false)}
                />
            </ResponsiveDialog>
        </div>
    );
};

export default NewAgentDialog;
