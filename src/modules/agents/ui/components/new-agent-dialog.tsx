import ResponsiveDialog from '@/components/responsive-dialog';
import { Agent } from 'http';
import React from 'react';
import AgentForm from './agent-form';

interface NewAgentDialogProp {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const NewAgentDialog = ({ open, onOpenChange }: NewAgentDialogProp) => {
    return (
        <div>
            <ResponsiveDialog
                title="New Agent"
                description="Create a new agent"
                open={open}
                onOpenChange={onOpenChange}
            >
                <AgentForm
                    onSuccess={() => onOpenChange(false)}
                    onCancel={() => onOpenChange(false)}
                />
            </ResponsiveDialog>
        </div>
    );
};

export default NewAgentDialog;
