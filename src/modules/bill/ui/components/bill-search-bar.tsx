'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon, Loader2Icon, HashIcon, XIcon } from 'lucide-react';

interface Props {
	input: string;
	isFetching: boolean;
	onChange: (v: string) => void;
	onSearch: () => void;
	onClear: () => void;
	onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const BillSearchBar = ({
	input,
	isFetching,
	onChange,
	onSearch,
	onClear,
	onKeyDown,
}: Props) => (
	<div className="flex items-center gap-2">
		<div className="relative w-72">
			<HashIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
			<Input
				value={input}
				onChange={(e) => onChange(e.target.value.toUpperCase())}
				onKeyDown={onKeyDown}
				placeholder="Order ID (first 8 chars)..."
				className="h-9 rounded-full border-gray-200 pr-8 pl-9 font-mono text-sm uppercase shadow-none focus-visible:border-green-500 focus-visible:ring-0"
			/>
			{input && (
				<button
					onClick={onClear}
					className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
				>
					<XIcon className="h-3.5 w-3.5" />
				</button>
			)}
		</div>
		<Button
			onClick={onSearch}
			disabled={!input.trim() || isFetching}
			className="h-9 rounded-full bg-green-600 px-5 text-sm font-semibold text-white hover:bg-green-700"
		>
			{isFetching ? (
				<Loader2Icon className="h-4 w-4 animate-spin" />
			) : (
				<>
					<SearchIcon className="mr-1.5 h-3.5 w-3.5" />
					Search
				</>
			)}
		</Button>
	</div>
);
