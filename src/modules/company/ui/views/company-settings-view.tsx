'use client';

import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	BuildingIcon,
	BanknoteIcon,
	QrCodeIcon,
	ReceiptIcon,
	SettingsIcon,
	ClockIcon,
	MonitorIcon,
	PercentIcon,
	CoinsIcon,
	GlobeIcon,
	PhoneIcon,
	MailIcon,
	MapPinIcon,
	ImageIcon,
	CheckIcon,
} from 'lucide-react';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { Suspense, useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorState from '@/components/error-state';
import { CompanySettingsViewLoading } from './company-settings-view-loading';
import { cn } from '@/lib/utils';
import {
	GroupLabel,
	SaveBtn,
	COMMON_TIMEZONES,
	COMMON_CURRENCIES,
} from '../components/company-form-helpers';

/* ── Schemas ── */
const companyInfoSchema = z.object({
	name: z.string().min(1, 'Company name is required'),
	tagline: z.string().optional(),
	logoUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
	address: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().email('Must be a valid email').or(z.literal('')).optional(),
	website: z.string().optional(),
});

const paymentSchema = z.object({
	bankName: z.string().optional(),
	bankAccountNumber: z.string().optional(),
	bankAccountName: z.string().optional(),
	qrisName: z.string().optional(),
	qrisImageUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});

const receiptSchema = z.object({
	receiptFooter: z.string().optional(),
});

const pricingSchema = z.object({
	taxRate: z.coerce.number().min(0).max(100),
	serviceRate: z.coerce.number().min(0).max(100),
});

const currencySchema = z.object({
	currencyCode: z.string().min(1, 'Required').max(10),
	currencySymbol: z.string().min(1, 'Required').max(5),
	currencyLocale: z.string().min(1, 'Required'),
});

const timezoneSchema = z.object({
	timezone: z.string().min(1, 'Required'),
});

type CompanyInfo = z.infer<typeof companyInfoSchema>;
type Payment = z.infer<typeof paymentSchema>;
type ReceiptSettings = z.infer<typeof receiptSchema>;
type PricingSettings = z.infer<typeof pricingSchema>;
type CurrencySettings = z.infer<typeof currencySchema>;
type TimezoneSettings = z.infer<typeof timezoneSchema>;

const SIDEBAR_TABS = [
	{ value: 'company', label: 'Company Info', icon: BuildingIcon, desc: 'Identity & contact' },
	{ value: 'payment', label: 'Payment', icon: BanknoteIcon, desc: 'Bank & QRIS' },
	{ value: 'pricing', label: 'Pricing', icon: PercentIcon, desc: 'Tax & service rate' },
	{ value: 'receipt', label: 'Receipt', icon: ReceiptIcon, desc: 'Footer text' },
	{ value: 'currency', label: 'Currency', icon: CoinsIcon, desc: 'Format & symbol' },
	{ value: 'timezone', label: 'Timezone', icon: ClockIcon, desc: 'Local time & zone' },
];

const CompanySettingsContent = () => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { data: settings } = useSuspenseQuery(trpc.company.get.queryOptions());

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: trpc.company.get.queryKey() });
	const upsert = useMutation(
		trpc.company.upsert.mutationOptions({
			onSuccess: () => {
				invalidate();
				toast.success('Settings saved');
			},
			onError: (e) => toast.error(e.message),
		})
	);

	const infoForm = useForm<CompanyInfo>({
		resolver: zodResolver(companyInfoSchema),
		defaultValues: {
			name: settings?.name ?? 'FoodOrder',
			tagline: settings?.tagline ?? '',
			logoUrl: settings?.logoUrl ?? '',
			address: settings?.address ?? '',
			phone: settings?.phone ?? '',
			email: settings?.email ?? '',
			website: settings?.website ?? '',
		},
	});
	const logoUrl = infoForm.watch('logoUrl');

	const paymentForm = useForm<Payment>({
		resolver: zodResolver(paymentSchema),
		defaultValues: {
			bankName: settings?.bankName ?? '',
			bankAccountNumber: settings?.bankAccountNumber ?? '',
			bankAccountName: settings?.bankAccountName ?? '',
			qrisName: settings?.qrisName ?? '',
			qrisImageUrl: settings?.qrisImageUrl ?? '',
		},
	});
	const qrisUrl = paymentForm.watch('qrisImageUrl');

	const receiptForm = useForm<ReceiptSettings>({
		resolver: zodResolver(receiptSchema),
		defaultValues: { receiptFooter: settings?.receiptFooter ?? '' },
	});

	const pricingForm = useForm<PricingSettings>({
		resolver: zodResolver(pricingSchema),
		defaultValues: {
			taxRate: Number(settings?.taxRate ?? 10),
			serviceRate: Number(settings?.serviceRate ?? 0),
		},
	});
	const watchedTaxRate = pricingForm.watch('taxRate');
	const watchedServiceRate = pricingForm.watch('serviceRate');
	const previewSubtotal = 100_000;
	const previewTax = previewSubtotal * ((Number(watchedTaxRate) || 0) / 100);
	const previewService = previewSubtotal * ((Number(watchedServiceRate) || 0) / 100);
	const previewTotal = previewSubtotal + previewTax + previewService;

	const currencyForm = useForm<CurrencySettings>({
		resolver: zodResolver(currencySchema),
		defaultValues: {
			currencyCode: settings?.currencyCode ?? 'USD',
			currencySymbol: settings?.currencySymbol ?? '$',
			currencyLocale: settings?.currencyLocale ?? 'en-US',
		},
	});

	const timezoneForm = useForm<TimezoneSettings>({
		resolver: zodResolver(timezoneSchema),
		defaultValues: { timezone: settings?.timezone ?? 'UTC' },
	});
	const watchedTimezone = timezoneForm.watch('timezone');
	const [useSystemTz, setUseSystemTz] = useState(false);
	const systemTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
	useEffect(() => {
		if (useSystemTz) timezoneForm.setValue('timezone', systemTz, { shouldDirty: true });
	}, [useSystemTz, systemTz, timezoneForm]);

	const [clockTime, setClockTime] = useState('');
	useEffect(() => {
		const tick = () => {
			try {
				setClockTime(
					new Intl.DateTimeFormat('en-US', {
						timeZone: watchedTimezone,
						hour: '2-digit',
						minute: '2-digit',
						second: '2-digit',
						hour12: false,
						weekday: 'short',
						month: 'short',
						day: 'numeric',
					}).format(new Date())
				);
			} catch {
				setClockTime('Invalid timezone');
			}
		};
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, [watchedTimezone]);

	const watchedCode = currencyForm.watch('currencyCode');
	const watchedLocale = currencyForm.watch('currencyLocale');
	const previewAmount = (() => {
		try {
			return new Intl.NumberFormat(watchedLocale || 'en-US', {
				style: 'currency',
				currency: watchedCode || 'USD',
				minimumFractionDigits: 2,
			}).format(12500);
		} catch {
			return '—';
		}
	})();

	return (
		<div className="flex flex-1 flex-col overflow-hidden">
			{/* Header */}
			<div className="shrink-0 border-b bg-white px-6 py-5">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700">
						<SettingsIcon className="h-5 w-5 text-white" />
					</div>
					<div>
						<h1 className="text-base font-semibold text-gray-900">Company Settings</h1>
						<p className="text-xs text-gray-400">
							Manage your company identity, payments, receipt and currency
						</p>
					</div>
				</div>
			</div>

			<div className="flex min-h-0 flex-1 bg-muted/40">
				<Tabs defaultValue="company" className="flex flex-1 flex-col md:flex-row">
					{/* Mobile pill bar */}
					<div className="shrink-0 border-b bg-white px-4 py-3 md:hidden">
						<TabsList className="grid w-full grid-cols-6 rounded-xl bg-gray-100 p-1 shadow-none">
							{SIDEBAR_TABS.map((tab) => (
								<TabsTrigger
									key={tab.value}
									value={tab.value}
									className={cn(
										'flex flex-col items-center gap-0.5 rounded-lg py-2 text-xs font-medium',
										'border-0 text-gray-500 shadow-none transition-all duration-150 outline-none',
										'data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm'
									)}
								>
									<tab.icon className="h-4 w-4" />
									<span className="text-[10px]">{tab.label}</span>
								</TabsTrigger>
							))}
						</TabsList>
					</div>

					{/* Desktop sidebar */}
					<TabsList
						className={cn(
							'sticky top-0 hidden h-fit w-52 shrink-0 flex-col items-stretch gap-0.5 self-start rounded-none border-r bg-white px-2 py-4 shadow-none md:flex'
						)}
					>
						<p className="mb-2 px-3 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
							Settings
						</p>
						{SIDEBAR_TABS.map((tab) => (
							<TabsTrigger
								key={tab.value}
								value={tab.value}
								className={cn(
									'group flex h-auto w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left',
									'border-0 bg-transparent shadow-none transition-all duration-150 ease-in-out outline-none',
									'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
									'data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md'
								)}
							>
								<div
									className={cn(
										'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150',
										'bg-gray-100 text-gray-500',
										'group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white',
										'group-hover:bg-gray-200 group-data-[state=active]:group-hover:bg-white/25'
									)}
								>
									<tab.icon className="h-4 w-4" />
								</div>
								<div className="min-w-0 flex-1 text-left">
									<p className="text-xs leading-tight font-semibold">
										{tab.label}
									</p>
									<p
										className={cn(
											'mt-0.5 text-[10px] leading-tight text-gray-400',
											'group-data-[state=active]:text-green-100'
										)}
									>
										{tab.desc}
									</p>
								</div>
								<span
									className={cn(
										'h-1.5 w-1.5 shrink-0 rounded-full bg-white opacity-0 transition-opacity duration-150',
										'group-data-[state=active]:opacity-100'
									)}
								/>
							</TabsTrigger>
						))}
					</TabsList>

					{/* Company tab */}
					<TabsContent
						value="company"
						className="mt-0 min-h-0 flex-1 overflow-y-auto p-4 md:p-6"
					>
						<div className="mx-auto max-w-3xl">
							<Form {...infoForm}>
								<form onSubmit={infoForm.handleSubmit((v) => upsert.mutate(v))}>
									<div className="rounded-2xl border bg-white shadow-sm">
										<div className="grid grid-cols-1 gap-0 lg:grid-cols-[200px_1fr]">
											<div className="flex flex-col items-center gap-4 border-r-0 border-b bg-gray-50 px-6 py-8 lg:rounded-l-2xl lg:border-r lg:border-b-0">
												<div
													className={cn(
														'relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 bg-white',
														logoUrl
															? 'border-green-200'
															: 'border-dashed border-gray-200'
													)}
												>
													{logoUrl ? (
														<Image
															src={logoUrl}
															alt="Logo"
															fill
															className="object-contain p-2"
														/>
													) : (
														<BuildingIcon className="h-10 w-10 text-gray-300" />
													)}
												</div>
												<div className="text-center">
													<p className="text-sm font-semibold text-gray-700">
														{infoForm.watch('name') || 'Company Name'}
													</p>
													{infoForm.watch('tagline') && (
														<p className="mt-0.5 text-xs text-gray-400">
															{infoForm.watch('tagline')}
														</p>
													)}
												</div>
												<p className="text-center text-[11px] text-gray-400">
													Paste a URL below to preview your logo
												</p>
											</div>

											<div className="space-y-4 px-6 py-6">
												<GroupLabel>Basic Info</GroupLabel>
												<div className="grid gap-4 sm:grid-cols-2">
													<FormField
														control={infoForm.control}
														name="name"
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Company Name{' '}
																	<span className="text-red-500">
																		*
																	</span>
																</FormLabel>
																<FormControl>
																	<Input
																		placeholder="FoodOrder"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={infoForm.control}
														name="tagline"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Tagline</FormLabel>
																<FormControl>
																	<Input
																		placeholder="Best food in town"
																		{...field}
																	/>
																</FormControl>
															</FormItem>
														)}
													/>
												</div>
												<FormField
													control={infoForm.control}
													name="logoUrl"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="flex items-center gap-1.5">
																<ImageIcon className="h-3.5 w-3.5" />
																Logo URL
															</FormLabel>
															<FormControl>
																<Input
																	placeholder="https://example.com/logo.png"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<Separator />
												<GroupLabel>Contact Details</GroupLabel>
												<div className="grid gap-4 sm:grid-cols-2">
													<FormField
														control={infoForm.control}
														name="phone"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-1.5">
																	<PhoneIcon className="h-3.5 w-3.5" />
																	Phone
																</FormLabel>
																<FormControl>
																	<Input
																		placeholder="+62 21 1234 5678"
																		{...field}
																	/>
																</FormControl>
															</FormItem>
														)}
													/>
													<FormField
														control={infoForm.control}
														name="email"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-1.5">
																	<MailIcon className="h-3.5 w-3.5" />
																	Email
																</FormLabel>
																<FormControl>
																	<Input
																		placeholder="hello@company.com"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
												<FormField
													control={infoForm.control}
													name="website"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="flex items-center gap-1.5">
																<GlobeIcon className="h-3.5 w-3.5" />
																Website
															</FormLabel>
															<FormControl>
																<Input
																	placeholder="https://company.com"
																	{...field}
																/>
															</FormControl>
														</FormItem>
													)}
												/>
												<FormField
													control={infoForm.control}
													name="address"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="flex items-center gap-1.5">
																<MapPinIcon className="h-3.5 w-3.5" />
																Address
															</FormLabel>
															<FormControl>
																<Textarea
																	placeholder="Jl. Sudirman No. 1, Jakarta"
																	rows={2}
																	className="resize-none"
																	{...field}
																/>
															</FormControl>
														</FormItem>
													)}
												/>
											</div>
										</div>
										<Separator />
										<div className="flex justify-end px-6 py-4">
											<SaveBtn isPending={upsert.isPending} />
										</div>
									</div>
								</form>
							</Form>
						</div>
					</TabsContent>

					{/* Payment tab */}
					<TabsContent
						value="payment"
						className="mt-0 min-h-0 flex-1 overflow-y-auto p-4 md:p-6"
					>
						<div className="mx-auto max-w-3xl">
							<Form {...paymentForm}>
								<form onSubmit={paymentForm.handleSubmit((v) => upsert.mutate(v))}>
									<div className="rounded-2xl border bg-white shadow-sm">
										<div className="space-y-6 px-6 py-6">
											<div>
												<GroupLabel>Bank Account</GroupLabel>
												<div className="grid gap-4 sm:grid-cols-3">
													<FormField
														control={paymentForm.control}
														name="bankName"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Bank Name</FormLabel>
																<FormControl>
																	<Input
																		placeholder="BCA"
																		{...field}
																	/>
																</FormControl>
															</FormItem>
														)}
													/>
													<FormField
														control={paymentForm.control}
														name="bankAccountNumber"
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Account Number
																</FormLabel>
																<FormControl>
																	<Input
																		placeholder="1234567890"
																		className="font-mono"
																		{...field}
																	/>
																</FormControl>
															</FormItem>
														)}
													/>
													<FormField
														control={paymentForm.control}
														name="bankAccountName"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Account Name</FormLabel>
																<FormControl>
																	<Input
																		placeholder="PT. Food Order"
																		{...field}
																	/>
																</FormControl>
															</FormItem>
														)}
													/>
												</div>
											</div>
											<Separator />
											<div>
												<GroupLabel>QRIS</GroupLabel>
												<div className="grid gap-6 sm:grid-cols-2">
													<div className="space-y-4">
														<FormField
															control={paymentForm.control}
															name="qrisName"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>QRIS Name</FormLabel>
																	<FormControl>
																		<Input
																			placeholder="Food Order Restaurant"
																			{...field}
																		/>
																	</FormControl>
																</FormItem>
															)}
														/>
														<FormField
															control={paymentForm.control}
															name="qrisImageUrl"
															render={({ field }) => (
																<FormItem>
																	<FormLabel className="flex items-center gap-1.5">
																		<QrCodeIcon className="h-3.5 w-3.5" />
																		QRIS Image URL
																	</FormLabel>
																	<FormControl>
																		<Input
																			placeholder="https://example.com/qris.png"
																			{...field}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>
													<div className="flex items-center justify-center">
														<div
															className={cn(
																'relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl border-2 bg-gray-50',
																qrisUrl
																	? 'border-green-200'
																	: 'border-dashed border-gray-200'
															)}
														>
															{qrisUrl ? (
																<Image
																	src={qrisUrl}
																	alt="QRIS"
																	fill
																	className="object-contain p-2"
																/>
															) : (
																<QrCodeIcon className="h-12 w-12 text-gray-200" />
															)}
														</div>
													</div>
												</div>
											</div>
										</div>
										<Separator />
										<div className="flex justify-end px-6 py-4">
											<SaveBtn isPending={upsert.isPending} />
										</div>
									</div>
								</form>
							</Form>
						</div>
					</TabsContent>

					{/* Pricing tab */}
					<TabsContent
						value="pricing"
						className="mt-0 min-h-0 flex-1 overflow-y-auto p-4 md:p-6"
					>
						<div className="mx-auto max-w-2xl">
							<Form {...pricingForm}>
								<form onSubmit={pricingForm.handleSubmit((v) => upsert.mutate(v))}>
									<div className="rounded-2xl border bg-white shadow-sm">
										<div className="space-y-6 px-6 py-6">
											<div className="grid gap-4 sm:grid-cols-2">
												<FormField
													control={pricingForm.control}
													name="taxRate"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="flex items-center gap-1.5">
																<PercentIcon className="h-3.5 w-3.5" />
																Tax Rate
															</FormLabel>
															<FormControl>
																<div className="relative">
																	<Input
																		type="number"
																		min="0"
																		max="100"
																		step="0.5"
																		placeholder="10"
																		{...field}
																		className="pr-8"
																	/>
																	<span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-400">
																		%
																	</span>
																</div>
															</FormControl>
															<FormMessage />
															<p className="text-[11px] text-gray-400">
																Applied to every order subtotal
															</p>
														</FormItem>
													)}
												/>
												<FormField
													control={pricingForm.control}
													name="serviceRate"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="flex items-center gap-1.5">
																<PercentIcon className="h-3.5 w-3.5" />
																Service Charge
															</FormLabel>
															<FormControl>
																<div className="relative">
																	<Input
																		type="number"
																		min="0"
																		max="100"
																		step="0.5"
																		placeholder="0"
																		{...field}
																		className="pr-8"
																	/>
																	<span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-400">
																		%
																	</span>
																</div>
															</FormControl>
															<FormMessage />
															<p className="text-[11px] text-gray-400">
																Added on top of subtotal
															</p>
														</FormItem>
													)}
												/>
											</div>
											<Separator />
											<div>
												<GroupLabel>Order Preview</GroupLabel>
												<div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50 text-sm">
													<div className="flex justify-between px-4 py-2.5">
														<span className="text-gray-500">
															Subtotal
														</span>
														<span className="font-mono font-medium text-gray-700">
															100,000
														</span>
													</div>
													<div className="flex justify-between border-t px-4 py-2.5">
														<span className="text-gray-500">
															Tax ({Number(watchedTaxRate) || 0}%)
														</span>
														<span className="font-mono font-medium text-gray-700">
															{previewTax.toLocaleString()}
														</span>
													</div>
													<div className="flex justify-between border-t px-4 py-2.5">
														<span className="text-gray-500">
															Service (
															{Number(watchedServiceRate) || 0}%)
														</span>
														<span className="font-mono font-medium text-gray-700">
															{previewService.toLocaleString()}
														</span>
													</div>
													<div className="flex justify-between border-t bg-green-50 px-4 py-3">
														<span className="font-semibold text-green-700">
															Total
														</span>
														<span className="font-mono text-base font-bold text-green-800">
															{previewTotal.toLocaleString()}
														</span>
													</div>
												</div>
											</div>
										</div>
										<Separator />
										<div className="flex justify-end px-6 py-4">
											<SaveBtn isPending={upsert.isPending} />
										</div>
									</div>
								</form>
							</Form>
						</div>
					</TabsContent>

					{/* Receipt tab */}
					<TabsContent
						value="receipt"
						className="mt-0 min-h-0 flex-1 overflow-y-auto p-4 md:p-6"
					>
						<div className="mx-auto max-w-2xl">
							<Form {...receiptForm}>
								<form onSubmit={receiptForm.handleSubmit((v) => upsert.mutate(v))}>
									<div className="rounded-2xl border bg-white shadow-sm">
										<div className="space-y-5 px-6 py-6">
											<FormField
												control={receiptForm.control}
												name="receiptFooter"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Receipt Footer Text</FormLabel>
														<FormControl>
															<Textarea
																placeholder="Thank you for dining with us! Visit again soon."
																rows={4}
																className="resize-none"
																{...field}
															/>
														</FormControl>
														<p className="text-xs text-gray-400">
															Shown at the bottom of every printed
															receipt
														</p>
													</FormItem>
												)}
											/>
										</div>
										<Separator />
										<div className="flex justify-end px-6 py-4">
											<SaveBtn isPending={upsert.isPending} />
										</div>
									</div>
								</form>
							</Form>
						</div>
					</TabsContent>

					{/* Currency tab */}
					<TabsContent
						value="currency"
						className="mt-0 min-h-0 flex-1 overflow-y-auto p-4 md:p-6"
					>
						<div className="mx-auto max-w-2xl">
							<Form {...currencyForm}>
								<form onSubmit={currencyForm.handleSubmit((v) => upsert.mutate(v))}>
									<div className="rounded-2xl border bg-white shadow-sm">
										<div className="space-y-6 px-6 py-6">
											<div>
												<GroupLabel>Quick Select</GroupLabel>
												<div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
													{COMMON_CURRENCIES.map((c) => {
														const isActive = watchedCode === c.code;
														return (
															<button
																type="button"
																key={c.code}
																onClick={() => {
																	currencyForm.setValue(
																		'currencyCode',
																		c.code
																	);
																	currencyForm.setValue(
																		'currencySymbol',
																		c.symbol
																	);
																	currencyForm.setValue(
																		'currencyLocale',
																		c.locale
																	);
																}}
																className={cn(
																	'flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-xs font-medium transition-all',
																	isActive
																		? 'border-green-600 bg-green-50 text-green-700 shadow-sm'
																		: 'border-gray-100 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50'
																)}
															>
																<span className="text-lg leading-none font-bold">
																	{c.symbol}
																</span>
																<span className="font-semibold">
																	{c.code}
																</span>
																<span className="w-full truncate text-center text-[10px] text-gray-400">
																	{c.label}
																</span>
																{isActive && (
																	<CheckIcon className="h-3 w-3 text-green-600" />
																)}
															</button>
														);
													})}
												</div>
											</div>
											<Separator />
											<div>
												<GroupLabel>Manual Configuration</GroupLabel>
												<div className="grid gap-4 sm:grid-cols-3">
													<FormField
														control={currencyForm.control}
														name="currencyCode"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Currency Code</FormLabel>
																<FormControl>
																	<Input
																		placeholder="USD"
																		maxLength={10}
																		className="font-mono uppercase"
																		{...field}
																		onChange={(e) =>
																			field.onChange(
																				e.target.value.toUpperCase()
																			)
																		}
																	/>
																</FormControl>
																<FormMessage />
																<p className="text-[11px] text-gray-400">
																	ISO 4217 (e.g. USD, IDR)
																</p>
															</FormItem>
														)}
													/>
													<FormField
														control={currencyForm.control}
														name="currencySymbol"
														render={({ field }) => (
															<FormItem>
																<FormLabel>
																	Currency Symbol
																</FormLabel>
																<FormControl>
																	<Input
																		placeholder="$"
																		maxLength={5}
																		className="font-mono"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
																<p className="text-[11px] text-gray-400">
																	Shown before/after amounts
																</p>
															</FormItem>
														)}
													/>
													<FormField
														control={currencyForm.control}
														name="currencyLocale"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Locale</FormLabel>
																<FormControl>
																	<Input
																		placeholder="en-US"
																		className="font-mono"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
																<p className="text-[11px] text-gray-400">
																	BCP 47 (e.g. id-ID)
																</p>
															</FormItem>
														)}
													/>
												</div>
											</div>
											<div className="flex items-center justify-between rounded-xl border border-green-100 bg-green-50 px-4 py-3">
												<div>
													<p className="text-xs font-semibold text-green-700">
														Live Preview
													</p>
													<p className="text-xs text-gray-400">
														How 12,500 will appear
													</p>
												</div>
												<p className="font-mono text-xl font-bold text-green-800">
													{previewAmount}
												</p>
											</div>
										</div>
										<Separator />
										<div className="flex justify-end px-6 py-4">
											<SaveBtn isPending={upsert.isPending} />
										</div>
									</div>
								</form>
							</Form>
						</div>
					</TabsContent>

					{/* Timezone tab */}
					<TabsContent
						value="timezone"
						className="mt-0 min-h-0 flex-1 overflow-y-auto p-4 md:p-6"
					>
						<div className="mx-auto max-w-2xl">
							<Form {...timezoneForm}>
								<form onSubmit={timezoneForm.handleSubmit((v) => upsert.mutate(v))}>
									<div className="rounded-2xl border bg-white shadow-sm">
										<div className="space-y-6 px-6 py-6">
											<div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
												<div className="flex items-center gap-3">
													<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
														<MonitorIcon className="h-4 w-4 text-gray-500" />
													</div>
													<div>
														<p className="text-xs font-semibold text-gray-700">
															Use system timezone
														</p>
														<p className="text-[11px] text-gray-400">
															Detected:{' '}
															<span className="font-mono">
																{systemTz}
															</span>
														</p>
													</div>
												</div>
												<Switch
													checked={useSystemTz}
													onCheckedChange={(v) => {
														setUseSystemTz(v);
														if (!v)
															timezoneForm.setValue(
																'timezone',
																watchedTimezone
															);
													}}
												/>
											</div>
											<div className="flex items-center justify-between rounded-xl border border-green-100 bg-green-50 px-4 py-4">
												<div>
													<p className="text-xs font-semibold text-green-700">
														Live Clock
													</p>
													<p className="mt-0.5 text-[11px] text-gray-400">
														{watchedTimezone}
													</p>
												</div>
												<p className="font-mono text-xl font-bold text-green-800 tabular-nums">
													{clockTime || '—'}
												</p>
											</div>
											<div
												className={cn(
													useSystemTz && 'pointer-events-none opacity-40'
												)}
											>
												<GroupLabel>Common Timezones</GroupLabel>
												<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
													{COMMON_TIMEZONES.map((tz) => {
														const isActive =
															watchedTimezone === tz.value;
														return (
															<button
																type="button"
																key={tz.value}
																onClick={() =>
																	timezoneForm.setValue(
																		'timezone',
																		tz.value
																	)
																}
																className={cn(
																	'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-all',
																	isActive
																		? 'border-green-600 bg-green-50 text-green-700 shadow-sm'
																		: 'border-gray-100 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50'
																)}
															>
																<ClockIcon
																	className={cn(
																		'h-3.5 w-3.5 shrink-0',
																		isActive
																			? 'text-green-600'
																			: 'text-gray-400'
																	)}
																/>
																<div className="min-w-0 flex-1">
																	<p className="truncate font-semibold">
																		{tz.label}
																	</p>
																	<p className="text-[10px] text-gray-400">
																		{tz.region}
																	</p>
																</div>
																{isActive && (
																	<CheckIcon className="h-3 w-3 shrink-0 text-green-600" />
																)}
															</button>
														);
													})}
												</div>
											</div>
											<Separator />
											<div
												className={cn(
													useSystemTz && 'pointer-events-none opacity-40'
												)}
											>
												<GroupLabel>Custom Timezone</GroupLabel>
												<FormField
													control={timezoneForm.control}
													name="timezone"
													render={({ field }) => (
														<FormItem className="max-w-sm">
															<FormLabel>
																IANA Timezone Identifier
															</FormLabel>
															<FormControl>
																<Input
																	placeholder="Asia/Singapore"
																	className="font-mono"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
															<p className="text-[11px] text-gray-400">
																e.g. Asia/Jakarta, Europe/London,
																America/New_York
															</p>
														</FormItem>
													)}
												/>
											</div>
										</div>
										<Separator />
										<div className="flex justify-end px-6 py-4">
											<SaveBtn isPending={upsert.isPending} />
										</div>
									</div>
								</form>
							</Form>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
};

const CompanySettingsView = () => (
	<div className="flex flex-1 flex-col">
		<ErrorBoundary
			fallback={
				<ErrorState title="Error loading settings" description="Please try again later." />
			}
		>
			<Suspense fallback={<CompanySettingsViewLoading />}>
				<CompanySettingsContent />
			</Suspense>
		</ErrorBoundary>
	</div>
);

export default CompanySettingsView;
