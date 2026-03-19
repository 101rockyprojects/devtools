import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = () => {
	// Netlify provides URL/DEPLOY_URL for the current deploy.
	// Prefer the main site URL (URL) but fall back to deploy-specific URL if missing.
	const siteUrl = env.URL ?? env.DEPLOY_URL ?? 'https://101rockyprojects.github.io/devtools';
	return { siteUrl };
};
