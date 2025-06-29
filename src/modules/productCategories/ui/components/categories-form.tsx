import React from 'react';
import { z } from 'zod';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import GenerateAvatar from '@/components/generate-avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CategoriesGetOne } from '../../types';
import { categoriesInsertSchema } from '../../schema';

interface CategoriesFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialValues?: CategoriesGetOne;
}
const CategoriesForm = ({ onSuccess, onCancel, initialValues }: CategoriesFormProps) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const createCategories = useMutation(
        trpc.categories.create.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries(trpc.categories.getMany.queryOptions({}));
                onSuccess?.();
            },
            onError: (error) => {
                toast.error(error.message);
            },
        })
    );

    const updateCategories = useMutation(
        trpc.categories.update.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
                if (initialValues?.id) {
                    await queryClient.invalidateQueries(
                        trpc.agents.getOne.queryOptions({
                            id: initialValues.id,
                        })
                    );
                }
                onSuccess?.();
            },
            onError: (error) => {
                toast.error(error.message);
            },
        })
    );

    const form = useForm<z.infer<typeof categoriesInsertSchema>>({
        resolver: zodResolver(categoriesInsertSchema),
        defaultValues: {
            name: initialValues?.name ?? '',
            description: initialValues?.description ?? '',
            imageUrl: initialValues?.imageUrl ?? '',
        },
    });

    const isEdit = !!initialValues?.id;
    const isPending = createCategories.isPending || updateCategories.isPending;

    const onSubmit = (values: z.infer<typeof categoriesInsertSchema>) => {
        if (isEdit) {
            updateCategories.mutate({ ...values, id: initialValues.id });
        } else {
            createCategories.mutate(values);
        }
    };
    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <GenerateAvatar
                    seed={form.watch('name')}
                    variant="botttsNeutral"
                    className="size-16 border"
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="e.g. John Doe" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder="e.g. You are a helpful assistant that can answer questions and help with assignments"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-between gap-x-2">
                    {onCancel && (
                        <Button
                            variant={'ghost'}
                            disabled={isPending}
                            type="button"
                            onClick={() => onCancel()}
                        >
                            Cancel
                        </Button>
                    )}

                    <Button type="submit" disabled={isPending}>
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default CategoriesForm;
