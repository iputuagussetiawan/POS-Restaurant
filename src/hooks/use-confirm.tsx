import ResponsiveDialog from '@/components/responsive-dialog';
import { Button } from '@/components/ui/button';
import { JSX, useState } from 'react';
import React from 'react';
export const UseConfirm = (
    title: string,
    description: string
): [() => JSX.Element, () => Promise<unknown>] => {
    const [promise, setPromise] = useState<{
        resolve: (value: boolean) => void;
    } | null>(null);

    const confirm = () => {
        return new Promise((resolve) => {
            setPromise({ resolve });
        });
    };

    const handleClose = () => {
        setPromise(null);
    };

    const handleConfirm = () => {
        promise?.resolve(true);
        handleClose();
    };

    const handleCancel = () => {
        promise?.resolve(false);
        handleClose();
    };

    const ConfirmationDialog = () => (
        <ResponsiveDialog
            open={promise !== null}
            onOpenChange={handleClose}
            title={title}
            description={description}
        >
            <div className="flex w-full flex-col-reverse items-center justify-end gap-x-2 gap-y-2 pt-4 lg:flex-row">
                <Button className="w-full lg:w-auto" variant="outline" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button className="w-full lg:w-auto" onClick={handleConfirm}>
                    Confirm
                </Button>
            </div>
        </ResponsiveDialog>
    );

    return [ConfirmationDialog, confirm];
};
