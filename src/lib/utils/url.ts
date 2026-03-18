export function safeExternalHttpUrl(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return null;

    try {
        const url = new URL(trimmed);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
        return url.toString();
    } catch {
        return null;
    }
}

