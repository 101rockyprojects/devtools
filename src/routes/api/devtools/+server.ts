import { json, type RequestHandler } from '@sveltejs/kit';
import { getSupabaseAnonClient } from '$lib/server/supabase';
import type { Tool } from '$lib/types/tool';

type DevtoolRow = {
    id: string;
    added_at: string;
    name: string;
    description: string;
    details: string;
    category: string;
    tags: string[];
    url: string;
    cover_image: string | null;
};

function toTool(row: DevtoolRow): Tool {
    return {
        id: row.id,
        addedAt: row.added_at,
        name: row.name,
        description: row.description,
        details: row.details,
        category: row.category,
        tags: row.tags ?? [],
        url: row.url,
        coverImage: row.cover_image ?? ''
    };
}

export const GET: RequestHandler = async () => {
    const supabase = getSupabaseAnonClient();

    const { data, error } = await supabase
        .schema('api')
        .from('devtools')
        .select(
            'id,added_at,name,description,details,category,tags,url,cover_image'
        )
        .order('added_at', { ascending: false });

    if (error) {
        return json(
            { error: 'Failed to load devtools', details: error.message },
            { status: 500 }
        );
    }

    const tools = (data as DevtoolRow[]).map(toTool);

    return json(tools, {
        headers: {
            'Cache-Control': 'public, max-age=60'
        }
    });
};

