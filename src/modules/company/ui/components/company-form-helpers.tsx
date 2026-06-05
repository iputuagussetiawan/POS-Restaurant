import { Button } from '@/components/ui/button';
import { SaveIcon, Loader2Icon } from 'lucide-react';

export const GroupLabel = ({ children }: { children: React.ReactNode }) => (
	<p className="mb-3 text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
		{children}
	</p>
);

export const SaveBtn = ({ isPending }: { isPending: boolean }) => (
	<Button
		type="submit"
		disabled={isPending}
		className="gap-2 bg-green-700 px-6 hover:bg-green-800"
	>
		{isPending ? (
			<Loader2Icon className="h-4 w-4 animate-spin" />
		) : (
			<SaveIcon className="h-4 w-4" />
		)}
		Save Changes
	</Button>
);

export const COMMON_TIMEZONES = [
	{ value: 'UTC', label: 'UTC', region: 'Universal' },
	{ value: 'America/New_York', label: 'Eastern Time', region: 'US' },
	{ value: 'America/Chicago', label: 'Central Time', region: 'US' },
	{ value: 'America/Denver', label: 'Mountain Time', region: 'US' },
	{ value: 'America/Los_Angeles', label: 'Pacific Time', region: 'US' },
	{ value: 'Europe/London', label: 'London', region: 'Europe' },
	{ value: 'Europe/Paris', label: 'Paris / Berlin', region: 'Europe' },
	{ value: 'Europe/Moscow', label: 'Moscow', region: 'Europe' },
	{ value: 'Asia/Dubai', label: 'Dubai', region: 'Middle East' },
	{ value: 'Asia/Kolkata', label: 'India (IST)', region: 'Asia' },
	{ value: 'Asia/Bangkok', label: 'Bangkok / Jakarta', region: 'Asia' },
	{ value: 'Asia/Singapore', label: 'Singapore / KL', region: 'Asia' },
	{ value: 'Asia/Makassar', label: 'Bali / Lombok (WITA)', region: 'Asia' },
	{ value: 'Asia/Jayapura', label: 'Papua (WIT)', region: 'Asia' },
	{ value: 'Asia/Tokyo', label: 'Tokyo', region: 'Asia' },
	{ value: 'Australia/Sydney', label: 'Sydney', region: 'Pacific' },
	{ value: 'Pacific/Auckland', label: 'Auckland', region: 'Pacific' },
];

export const COMMON_CURRENCIES = [
	{ code: 'USD', symbol: '$', locale: 'en-US', label: 'US Dollar' },
	{ code: 'EUR', symbol: '€', locale: 'de-DE', label: 'Euro' },
	{ code: 'GBP', symbol: '£', locale: 'en-GB', label: 'British Pound' },
	{ code: 'IDR', symbol: 'Rp', locale: 'id-ID', label: 'Indonesian Rupiah' },
	{ code: 'SGD', symbol: 'S$', locale: 'en-SG', label: 'Singapore Dollar' },
	{ code: 'MYR', symbol: 'RM', locale: 'ms-MY', label: 'Malaysian Ringgit' },
	{ code: 'THB', symbol: '฿', locale: 'th-TH', label: 'Thai Baht' },
	{ code: 'JPY', symbol: '¥', locale: 'ja-JP', label: 'Japanese Yen' },
	{ code: 'AUD', symbol: 'A$', locale: 'en-AU', label: 'Australian Dollar' },
];
