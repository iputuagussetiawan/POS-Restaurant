import Link from 'next/link';
import Image from 'next/image';
import {
	ArrowRightIcon,
	CheckIcon,
	ShieldCheckIcon,
	ZapIcon,
	BarChart3Icon,
	UsersIcon,
	ShoppingCartIcon,
	LayoutDashboardIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import LandingUserButton from '@/components/landing-user-button';

const FEATURES = [
	{
		icon: ShoppingCartIcon,
		title: 'Fast Order Processing',
		description: 'Take orders in seconds with an intuitive POS interface built for speed.',
	},
	{
		icon: BarChart3Icon,
		title: 'Real-time Analytics',
		description: 'Monitor sales, revenue, and product performance with live dashboards.',
	},
	{
		icon: UsersIcon,
		title: 'Team Management',
		description: 'Manage staff roles — admin, manager, and cashier — with fine-grained access.',
	},
	{
		icon: ZapIcon,
		title: 'Menu Control',
		description: 'Add, edit, and organise products and categories with rich descriptions.',
	},
	{
		icon: ShieldCheckIcon,
		title: 'Secure & Reliable',
		description: 'Role-based auth with session management keeps your data protected.',
	},
	{
		icon: CheckIcon,
		title: 'Always Available',
		description: 'Cloud-hosted on Neon Postgres — available wherever you need it.',
	},
];

const PLANS = [
	{
		name: 'Starter',
		price: 'Free',
		desc: 'Perfect for small cafes just getting started.',
		features: ['Up to 50 products', '1 cashier account', 'Basic analytics', 'Email support'],
		cta: 'Get started',
		highlight: false,
	},
	{
		name: 'Pro',
		price: '$29',
		period: '/month',
		desc: 'For growing restaurants that need more power.',
		features: [
			'Unlimited products',
			'Up to 10 staff accounts',
			'Advanced analytics',
			'Priority support',
			'Custom categories',
		],
		cta: 'Start free trial',
		highlight: true,
	},
	{
		name: 'Enterprise',
		price: 'Custom',
		desc: 'For large chains and multi-location businesses.',
		features: [
			'Everything in Pro',
			'Unlimited staff',
			'Dedicated support',
			'Custom integrations',
			'SLA guarantee',
		],
		cta: 'Contact sales',
		highlight: false,
	},
];

export default async function LandingPage() {
	const session = await auth.api.getSession({ headers: await headers() });
	const user = session?.user ?? null;

	return (
		<div className="min-h-screen bg-white text-foreground">
			{/* ── Nav ── */}
			<header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
					<div className="flex items-center gap-x-2">
						<div className="flex size-8 items-center justify-center rounded-lg bg-green-700">
							<ShoppingCartIcon className="size-4 text-white" />
						</div>
						<span className="text-lg font-bold tracking-tight">FoodOrder POS</span>
					</div>

					<nav className="hidden items-center gap-x-8 text-sm text-muted-foreground md:flex">
						<a href="#features" className="transition-colors hover:text-foreground">
							Features
						</a>
						<a href="#pricing" className="transition-colors hover:text-foreground">
							Pricing
						</a>
					</nav>

					<div className="flex items-center gap-x-3">
						{user ? (
							<>
								<Button
									variant="outline"
									size="sm"
									className="hidden gap-x-1.5 sm:flex"
									asChild
								>
									<Link href="/">
										<LayoutDashboardIcon className="size-3.5" />
										Dashboard
									</Link>
								</Button>
								<LandingUserButton user={user} />
							</>
						) : (
							<>
								<Button variant="ghost" size="sm" asChild>
									<Link href="/sign-in">Sign in</Link>
								</Button>
								<Button
									size="sm"
									className="bg-green-700 hover:bg-green-800"
									asChild
								>
									<Link href="/sign-up">Get started</Link>
								</Button>
							</>
						)}
					</div>
				</div>
			</header>

			{/* ── Hero ── */}
			<section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white">
				<div className="mx-auto max-w-6xl px-6 py-24 text-center md:py-36">
					<span className="inline-block rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
						Restaurant POS System
					</span>
					<h1 className="mt-6 text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
						Run your restaurant
						<br />
						<span className="text-green-700">smarter & faster</span>
					</h1>
					<p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
						A modern point-of-sale platform built for restaurants, cafes, and food
						businesses. Manage orders, menus, staff, and analytics — all in one place.
					</p>
					<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
						{user ? (
							<Button
								size="lg"
								className="gap-x-2 bg-green-700 px-8 hover:bg-green-800"
								asChild
							>
								<Link href="/">
									Go to Dashboard <ArrowRightIcon className="size-4" />
								</Link>
							</Button>
						) : (
							<>
								<Button
									size="lg"
									className="gap-x-2 bg-green-700 px-8 hover:bg-green-800"
									asChild
								>
									<Link href="/sign-up">
										Start for free <ArrowRightIcon className="size-4" />
									</Link>
								</Button>
								<Button size="lg" variant="outline" className="px-8" asChild>
									<Link href="/sign-in">Sign in to dashboard</Link>
								</Button>
							</>
						)}
					</div>

					{/* hero image */}
					<div className="relative mx-auto mt-16 max-w-4xl overflow-hidden rounded-2xl border shadow-2xl">
						<Image
							src="/images/Pizza-3007395.jpg"
							alt="FoodOrder POS dashboard preview"
							width={1200}
							height={600}
							className="h-72 w-full object-cover md:h-96"
							priority
						/>
						<div className="absolute inset-0 flex items-center justify-center bg-black/30">
							<div className="rounded-xl border border-white/20 bg-white/10 px-8 py-6 text-center backdrop-blur-sm">
								<p className="text-2xl font-bold text-white">Live POS Dashboard</p>
								<p className="mt-1 text-sm text-white/80">
									Orders · Menu · Analytics · Team
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ── Features ── */}
			<section id="features" className="bg-white py-24">
				<div className="mx-auto max-w-6xl px-6">
					<div className="text-center">
						<h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
							Everything you need to run your restaurant
						</h2>
						<p className="mt-4 text-base text-muted-foreground">
							Packed with features that save time and boost revenue.
						</p>
					</div>
					<div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
						{FEATURES.map((f) => {
							const Icon = f.icon;
							return (
								<div
									key={f.title}
									className="rounded-xl border bg-muted/30 p-6 transition-shadow hover:shadow-md"
								>
									<div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
										<Icon className="size-5 text-green-700" />
									</div>
									<h3 className="mt-4 font-semibold">{f.title}</h3>
									<p className="mt-2 text-sm text-muted-foreground">
										{f.description}
									</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* ── Pricing ── */}
			<section id="pricing" className="bg-muted/30 py-24">
				<div className="mx-auto max-w-6xl px-6">
					<div className="text-center">
						<h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
							Simple, transparent pricing
						</h2>
						<p className="mt-4 text-base text-muted-foreground">
							No hidden fees. Cancel anytime.
						</p>
					</div>
					<div className="mt-16 grid gap-8 sm:grid-cols-3">
						{PLANS.map((plan) => (
							<div
								key={plan.name}
								className={`relative flex flex-col rounded-2xl border p-8 ${
									plan.highlight
										? 'border-green-700 bg-green-700 text-white shadow-xl'
										: 'bg-white'
								}`}
							>
								{plan.highlight && (
									<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-0.5 text-xs font-bold text-amber-900">
										Most popular
									</span>
								)}
								<div>
									<p
										className={`text-sm font-medium ${plan.highlight ? 'text-green-100' : 'text-muted-foreground'}`}
									>
										{plan.name}
									</p>
									<div className="mt-2 flex items-baseline gap-x-1">
										<span className="text-4xl font-extrabold">
											{plan.price}
										</span>
										{plan.period && (
											<span
												className={`text-sm ${plan.highlight ? 'text-green-200' : 'text-muted-foreground'}`}
											>
												{plan.period}
											</span>
										)}
									</div>
									<p
										className={`mt-2 text-sm ${plan.highlight ? 'text-green-100' : 'text-muted-foreground'}`}
									>
										{plan.desc}
									</p>
								</div>
								<ul className="mt-8 flex-1 space-y-3">
									{plan.features.map((feat) => (
										<li
											key={feat}
											className="flex items-center gap-x-2 text-sm"
										>
											<CheckIcon
												className={`size-4 shrink-0 ${plan.highlight ? 'text-green-200' : 'text-green-700'}`}
											/>
											{feat}
										</li>
									))}
								</ul>
								<Button
									className={`mt-8 w-full ${
										plan.highlight
											? 'bg-white text-green-700 hover:bg-green-50'
											: 'bg-green-700 text-white hover:bg-green-800'
									}`}
									asChild
								>
									<Link href={user ? '/' : '/sign-up'}>{plan.cta}</Link>
								</Button>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── CTA ── */}
			<section className="bg-green-700 py-24 text-white">
				<div className="mx-auto max-w-2xl px-6 text-center">
					<h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
						Ready to transform your restaurant?
					</h2>
					<p className="mt-4 text-base text-green-100">
						Join thousands of restaurants already using FoodOrder POS to serve customers
						faster.
					</p>
					<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
						{user ? (
							<Button
								size="lg"
								className="bg-white px-10 text-green-700 hover:bg-green-50"
								asChild
							>
								<Link href="/">
									Go to Dashboard <ArrowRightIcon className="ml-2 size-4" />
								</Link>
							</Button>
						) : (
							<Button
								size="lg"
								className="bg-white px-10 text-green-700 hover:bg-green-50"
								asChild
							>
								<Link href="/sign-up">
									Get started free <ArrowRightIcon className="ml-2 size-4" />
								</Link>
							</Button>
						)}
					</div>
				</div>
			</section>

			{/* ── Footer ── */}
			<footer className="border-t bg-white px-6 py-8">
				<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
					<div className="flex items-center gap-x-2">
						<div className="flex size-6 items-center justify-center rounded-md bg-green-700">
							<ShoppingCartIcon className="size-3 text-white" />
						</div>
						<span className="font-semibold text-foreground">FoodOrder POS</span>
					</div>
					<p>© {new Date().getFullYear()} FoodOrder. All rights reserved.</p>
					<div className="flex gap-x-6">
						{user ? (
							<Link href="/" className="hover:text-foreground">
								Dashboard
							</Link>
						) : (
							<>
								<Link href="/sign-in" className="hover:text-foreground">
									Sign in
								</Link>
								<Link href="/sign-up" className="hover:text-foreground">
									Sign up
								</Link>
							</>
						)}
					</div>
				</div>
			</footer>
		</div>
	);
}
