'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export const KitchenLiveClock = () => {
	const [time, setTime] = useState('');
	useEffect(() => {
		const tick = () => setTime(format(new Date(), 'HH:mm:ss'));
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, []);
	return <span className="font-mono text-sm font-bold text-white tabular-nums">{time}</span>;
};
