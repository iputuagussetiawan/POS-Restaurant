export function formatNumberShort(num: number): string {
	if (!Number.isFinite(num)) return '';

	const absNum = Math.abs(num);
	const sign = num < 0 ? '-' : '';

	if (absNum >= 1_000_000_000) {
		return `${sign}${(absNum / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
	} else if (absNum >= 1_000_000) {
		return `${sign}${(absNum / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
	} else if (absNum >= 1_000) {
		return `${sign}${(absNum / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
	} else {
		return `${num}`;
	}
}