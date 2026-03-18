import type { PageLoad } from './$types';
import type { Tool } from '$lib/types/tool';

export const load: PageLoad = async ({ fetch }) => {
    const res = await fetch('/api/devtools');
    const tools: Tool[] = await res.json();
    return { tools };
};
