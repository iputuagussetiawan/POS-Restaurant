'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchIcon, XIcon, ChevronDownIcon, CheckIcon, UserPlusIcon } from 'lucide-react';
import { useUsersFilters } from '../../hooks/use-users-filter';
import { DEFAULT_PAGE } from '../../../../../constants';
import { useState } from 'react';
import CreateUserDialog from './create-user-dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type Role = 'admin' | 'manager' | 'cashier' | 'kitchen' | 'member' | 'pending';
type Status = 'active' | 'banned';

const ROLES: { value: Role; label: string; color: string }[] = [
	{ value: 'admin', label: 'Admin', color: 'text-red-600' },
	{ value: 'manager', label: 'Manager', color: 'text-blue-600' },
	{ value: 'cashier', label: 'Cashier', color: 'text-green-600' },
	{ value: 'kitchen', label: 'Kitchen', color: 'text-orange-600' },
	{ value: 'member', label: 'Member', color: 'text-purple-600' },
	{ value: 'pending', label: 'Pending', color: 'text-yellow-600' },
];

const STATUSES: { value: Status; label: string; color: string }[] = [
	{ value: 'active', label: 'Active', color: 'text-green-600' },
	{ value: 'banned', label: 'Banned', color: 'text-red-600' },
];

const UsersListHeader = () => {
	const [filters, setFilters] = useUsersFilters();
	const [createOpen, setCreateOpen] = useState(false);

	const isAnyFilterActive = !!(filters.search || filters.role || filters.status);

	const clearAll = () => setFilters({ search: '', role: null, status: null, page: DEFAULT_PAGE });

	return (
		<>
			<CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />

			<div className="border-b bg-background px-4 py-4 md:px-8 md:py-5">
				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<h1 className="text-xl font-bold tracking-tight md:text-2xl">
							User Management
						</h1>
						<p className="text-sm text-muted-foreground">
							Manage roles and access for all users.
						</p>
					</div>
					<Button
						onClick={() => setCreateOpen(true)}
						className="gap-2 bg-green-700 hover:bg-green-800"
						size="sm"
					>
						<UserPlusIcon className="h-4 w-4" />
						Create User
					</Button>
				</div>
			</div>

			<div className="sticky top-[57px] z-10 border-b bg-background/80 px-4 py-2.5 backdrop-blur-md md:px-8">
				<ScrollArea>
					<div className="flex w-full items-center gap-x-2">
						{/* search */}
						<div className="relative max-w-xs min-w-[180px] flex-1">
							<SearchIcon className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search by name..."
								value={filters.search}
								onChange={(e) =>
									setFilters({ search: e.target.value, page: DEFAULT_PAGE })
								}
								className="h-8 pl-8 text-sm"
							/>
						</div>

						<div className="h-5 w-px bg-border" />

						{/* role filter */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className={cn(
										'h-8 gap-x-1.5 text-xs font-medium',
										filters.role &&
											'border-primary/50 bg-primary/5 text-primary'
									)}
								>
									Role
									{filters.role ? (
										<span className="font-semibold capitalize">
											{filters.role}
										</span>
									) : null}
									<ChevronDownIcon className="size-3 opacity-60" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-36">
								{ROLES.map((r) => (
									<DropdownMenuItem
										key={r.value}
										onClick={() =>
											setFilters({
												role: filters.role === r.value ? null : r.value,
												page: DEFAULT_PAGE,
											})
										}
										className="flex items-center justify-between"
									>
										<span className={cn('capitalize', r.color)}>{r.label}</span>
										{filters.role === r.value && (
											<CheckIcon className="size-3.5 text-primary" />
										)}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						{/* status filter */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className={cn(
										'h-8 gap-x-1.5 text-xs font-medium',
										filters.status &&
											'border-primary/50 bg-primary/5 text-primary'
									)}
								>
									Status
									{filters.status ? (
										<span className="font-semibold capitalize">
											{filters.status}
										</span>
									) : null}
									<ChevronDownIcon className="size-3 opacity-60" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-32">
								{STATUSES.map((s) => (
									<DropdownMenuItem
										key={s.value}
										onClick={() =>
											setFilters({
												status: filters.status === s.value ? null : s.value,
												page: DEFAULT_PAGE,
											})
										}
										className="flex items-center justify-between"
									>
										<span className={cn('capitalize', s.color)}>{s.label}</span>
										{filters.status === s.value && (
											<CheckIcon className="size-3.5 text-primary" />
										)}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						{/* clear all */}
						{isAnyFilterActive && (
							<>
								<div className="h-5 w-px bg-border" />
								<Button
									variant="ghost"
									size="sm"
									onClick={clearAll}
									className="h-8 gap-x-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
								>
									<XIcon className="size-3" />
									Clear filters
								</Button>
							</>
						)}
					</div>
					<ScrollBar orientation="horizontal" />
				</ScrollArea>
			</div>
		</>
	);
};

export default UsersListHeader;
