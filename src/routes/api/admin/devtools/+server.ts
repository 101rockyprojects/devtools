import { json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import { env } from '$env/dynamic/private';
import { getSupabaseServiceClient } from '$lib/server/supabase';

const InsertIaSchema = z.object({
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().min(10).max(180),
    details: z.string().trim().min(10).max(1200),
    url: z.string().trim().min(8).max(2048),
    coverImage: z
        .string()
        .trim()
        .max(2048)
        .optional()
        .transform((v) => (v?.trim() ? v.trim() : undefined)),
    tags: z
        .array(z.string().trim().min(1).max(24))
        .max(12)
        .optional()
        .default([])
});

function isHttpUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

export const POST: RequestHandler = async (event) => {
    const adminPassword = env.ADMIN_PASSWORD;
    if (!adminPassword) {
        return json(
            { error: 'Server not configured (ADMIN_PASSWORD missing)' },
            { status: 500 }
        );
    }

    const provided = event.request.headers.get('x-admin-password') ?? '';
    if (provided !== adminPassword) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await event.request.json().catch(() => null);
    const parsed = InsertIaSchema.safeParse(body);
    if (!parsed.success) {
        return json(
            { error: 'Invalid input', issues: parsed.error.flatten() },
            { status: 400 }
        );
    }

    if (!isHttpUrl(parsed.data.url)) {
        return json({ error: 'Invalid URL (http/https only)' }, { status: 400 });
    }
    if (parsed.data.coverImage && !isHttpUrl(parsed.data.coverImage)) {
        return json(
            { error: 'Invalid coverImage (http/https only)' },
            { status: 400 }
        );
    }

    const supabase = getSupabaseServiceClient();

    const payload = {
        name: parsed.data.name,
        description: parsed.data.description,
        details: parsed.data.details,
        category: 'IA',
        url: parsed.data.url,
        cover_image: parsed.data.coverImage,
        tags: parsed.data.tags
    };

    const { data, error } = await supabase
        .schema('api')
        .from('devtools')
        .insert(payload)
        .select('id')
        .single();

    if (error) {
        return json(
            { error: 'Insert failed', details: error.message },
            { status: 500 }
        );
    }

    return json({ success: true, id: data.id });
};

