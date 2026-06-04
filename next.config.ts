import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		domains: ['images.pexels.com'],
	},
	experimental: {
		cssChunking: false,
	},
};

export default nextConfig;
