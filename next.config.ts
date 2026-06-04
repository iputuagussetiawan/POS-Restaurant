import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		domains: ['images.pexels.com'],
	},
	experimental: {
		cssChunking: 'simple',
	},
};

export default nextConfig;
