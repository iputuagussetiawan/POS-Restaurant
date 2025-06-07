import ResponsiveDialog from '@/components/responsive-dialog';
import React from 'react';
import AgentForm from './agent-form';
import { AgentGetOne } from '../../types';

interface UpdateAgentDialogProp {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialValues?: AgentGetOne;
}

const UpdateAgentDialog = ({ open, onOpenChange, initialValues }: UpdateAgentDialogProp) => {
    return (
        <div>
            <ResponsiveDialog
                title="Edit Agent"
                description="Edit the agent detail"
                open={open}
                onOpenChange={onOpenChange}
            >
                <AgentForm
                    onSuccess={() => onOpenChange(false)}
                    onCancel={() => onOpenChange(false)}
                    initialValues={initialValues}
                />
            </ResponsiveDialog>
        </div>
    );
};

export default UpdateAgentDialog;
