import { json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import { env } from '$env/dynamic/private';

const ALLOWED_CATEGORIES = ['IA', 'DevTool', 'Docs', 'Library', 'Tool'] as const;

const SuggestionSchema = z.object({
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().min(10).max(180),
    details: z.string().trim().min(10).max(1200),
    category: z.enum(ALLOWED_CATEGORIES),
    url: z
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

function normalizeText(value: string): string {
    return value
        .replace(/[\u0000-\u001F\u007F]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function isHttpUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const current = buckets.get(ip);

    if (!current || current.resetAt <= now) {
        buckets.set(ip, { count: 1, resetAt: now + windowMs });
        return true;
    }

    if (current.count >= limit) return false;
    current.count += 1;
    return true;
}

export const POST: RequestHandler = async (event) => {
    const contentLength = Number(event.request.headers.get('content-length') ?? '0');
    if (Number.isFinite(contentLength) && contentLength > 12_000) {
        return json({ error: 'Payload too large' }, { status: 413 });
    }

    const ip = event.getClientAddress();
    if (!rateLimit(ip, 5, 60 * 60 * 1000)) {
        return json({ error: 'Too many requests' }, { status: 429 });
    }

    let payload: unknown;
    try {
        payload = await event.request.json();
    } catch {
        return json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = SuggestionSchema.safeParse(payload);
    if (!parsed.success) {
        return json(
            { error: 'Invalid input', issues: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const web3formsKey = env.WEB3FORMS_API_KEY;
    if (!web3formsKey) {
        return json(
            { error: 'Server not configured (WEB3FORMS_API_KEY missing)' },
            { status: 500 }
        );
    }

    const suggestion = {
        name: normalizeText(parsed.data.name),
        description: normalizeText(parsed.data.description),
        details: normalizeText(parsed.data.details),
        category: parsed.data.category,
        url: parsed.data.url ? normalizeText(parsed.data.url) : undefined,
        tags: parsed.data.tags.map((t) => normalizeText(t.toLowerCase()))
    };

    if (suggestion.url && !isHttpUrl(suggestion.url)) {
        return json(
            { error: 'Invalid URL (only http/https allowed)' },
            { status: 400 }
        );
    }

    const toEmail = env.SUGGESTIONS_TO_EMAIL ?? 'rockystevendeveloper@gmail.com';

    const messageLines = [
        `New DevTool suggestion`,
        ``,
        `Name: ${suggestion.name}`,
        `Category: ${suggestion.category}`,
        `URL: ${suggestion.url ?? '(not provided)'}`,
        `Tags: ${suggestion.tags.length ? suggestion.tags.join(', ') : '(none)'}`,
        ``,
        `Description:`,
        suggestion.description,
        ``,
        `Details:`,
        suggestion.details,
        ``,
        `Meta:`,
        `Deliver to: ${toEmail}`,
        `IP: ${ip}`,
        `Time: ${new Date().toISOString()}`
    ];

    const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({
            access_key: web3formsKey,
            subject: `[DevTools Directory] Suggestion: ${suggestion.name}`,
            from_name: 'DevTools Directory',
            message: messageLines.join('\n')
        })
    });

    if (!res.ok) {
        return json(
            { error: 'Failed to submit suggestion', status: res.status },
            { status: 502 }
        );
    }

    const web3formsResponse = (await res.json().catch(() => null)) as
        | { success?: boolean; message?: string }
        | null;

    if (!web3formsResponse?.success) {
        return json(
            {
                error: 'Web3Forms rejected the request',
                details: web3formsResponse?.message
            },
            { status: 502 }
        );
    }

    return json({ success: true });
};
