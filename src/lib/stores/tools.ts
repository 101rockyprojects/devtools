import type { Tool } from '$lib/types/tool';
import { browser } from '$app/environment';

const STORAGE_KEY = 'devtools_directory';

/**
 * Loads tools from local storage (browser) or falls back to the API.
 */
export async function loadTools(): Promise<Tool[]> {
    if (browser) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as Tool[];
        }
    }

    const res = await fetch('/api/devtools');
    const tools: Tool[] = await res.json();

    if (browser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
    }

    return tools;
}

/**
 * Filters tools by a search query across all text fields.
 */
export function filterTools(tools: Tool[], query: string): Tool[] {
    if (!query.trim()) return tools;

    const lower = query.toLowerCase();

    return tools.filter((tool) => {
        return (
            tool.name.toLowerCase().includes(lower) ||
            tool.description.toLowerCase().includes(lower) ||
            tool.details.toLowerCase().includes(lower) ||
            tool.category.toLowerCase().includes(lower) ||
            tool.tags.some((tag) => tag.toLowerCase().includes(lower))
        );
    });
}
