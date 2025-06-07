import React from 'react';
import { z } from 'zod';
import { ProductGetOne } from '../../types';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { productInsertSchema } from '../../schema';
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

interface ProductFormProp {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialValues?: ProductGetOne;
}
const ProductForm = ({ onSuccess, onCancel, initialValues }: ProductFormProp) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const createProduct = useMutation(
        trpc.products.create.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries(trpc.products.getMany.queryOptions({}));
                onSuccess?.();
            },
            onError: (error) => {
                toast.error(error.message);
            },
        })
    );

    const updateProduct = useMutation(
        trpc.products.update.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries(trpc.products.getMany.queryOptions({}));
                if (initialValues?.id) {
                    await queryClient.invalidateQueries(
                        trpc.products.getOne.queryOptions({
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

    const form = useForm<z.infer<typeof productInsertSchema>>({
        resolver: zodResolver(productInsertSchema),
        defaultValues: {
            name: initialValues?.name ?? '',
            imageUrl: initialValues?.imageUrl ?? '',
            categoryId: initialValues?.categoryId ?? '',
        },
    });

    const isEdit = !!initialValues?.id;
    const isPending = createProduct.isPending || updateProduct.isPending;

    const onSubmit = (values: z.infer<typeof productInsertSchema>) => {
        if (isEdit) {
            updateProduct.mutate({ ...values, id: initialValues.id });
        } else {
            createProduct.mutate(values);
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

export default ProductForm;
