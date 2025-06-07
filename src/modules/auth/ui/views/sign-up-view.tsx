'use client';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { OctagonAlertIcon, Router } from 'lucide-react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { FaGithub, FaGoogle } from 'react-icons/fa';

const FormSchema = z
    .object({
        name: z.string().min(1, {
            message: 'Name is required.',
        }),
        email: z.string().email(),
        password: z.string().min(1, {
            message: 'Password must be at least 1 character.',
        }),
        confirmPassword: z.string().min(1, {
            message: 'Password must be at least 1 character.',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });
const SignUpView = () => {
    const router = useRouter();
    const [error, setError] = useState('');
    const [pending, setPending] = useState(false);
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = (data: z.infer<typeof FormSchema>) => {
        setError('');
        setPending(true);
        authClient.signUp.email(
            {
                name: data.name,
                email: data.email,
                password: data.password,
                callbackURL: '/',
            },
            {
                onSuccess: () => {
                    setPending(false);
                },
                onError: (error) => {
                    setError(error.error.message);
                    setPending(false);
                },
            }
        );
    };

    const onSocial = (provider: 'google' | 'github') => {
        setError('');
        setPending(true);
        authClient.signIn.social(
            {
                provider: provider,
                callbackURL: '/',
            },
            {
                onSuccess: () => {
                    setPending(false);
                    router.push('/');
                },
                onError: (error) => {
                    setPending(false);
                    setError(error.error.message);
                },
            }
        );
    };
    return (
        <div className="flex flex-col gap-6">
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col items-center text-center">
                                    <h1 className="text-2xl font-bold">Let&apos;s get started</h1>
                                    <p className="text-balance text-muted-foreground">
                                        Create your account
                                    </p>
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="john doe"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Username</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="jhondoe@gmail.com"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="******"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="******"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                {!!error && (
                                    <Alert className="border-none bg-destructive/10">
                                        <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                                        <AlertTitle>{error}</AlertTitle>
                                    </Alert>
                                )}
                                <Button disabled={pending} className="w-full" type="submit">
                                    Sign up
                                </Button>
                                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                                    <span className="relative z-10 bg-card px-2 text-muted-foreground">
                                        {' '}
                                        Or Continue With
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        onClick={() => onSocial('google')}
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <FaGoogle />
                                        Google
                                    </Button>
                                    <Button
                                        onClick={() => onSocial('github')}
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <FaGithub />
                                        Github
                                    </Button>
                                </div>
                                <div className="text-center text-sm">
                                    Already have an account?{' '}
                                    <Link
                                        className="underline underline-offset-4 hover:text-primary"
                                        href="/sign-in"
                                    >
                                        Sign In
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </Form>
                    <div className="relative hidden flex-col items-center justify-center gap-y-4 bg-radial from-sidebar-accent to-sidebar md:flex">
                        <Image
                            src="/logo.svg"
                            alt="logo"
                            width={92}
                            height={92}
                            className="h-[92px] w-[92px]"
                        />
                        <p className="text-2xl font-semibold text-white">Meet.AI</p>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center text-xs text-balance text-muted-foreground *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
                By clicking continue you agree to our
                <a href="#">Term of service</a> and <a href="">Privacy Policy</a>
            </div>
        </div>
    );
};

export default SignUpView;
