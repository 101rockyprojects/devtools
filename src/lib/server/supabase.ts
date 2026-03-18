import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

function requireEnv(name: string, value: string | undefined): string {
    if (!value) throw new Error(`Missing environment variable: ${name}`);
    return value;
}

function getSupabaseUrl(): string {
    return (env.SUPABASE_URL ?? env.SUPABASE_API_URL)!;
}

function getSupabaseAnonKey(): string {
    return env.SUPABASE_ANON_KEY!;
}

let anonClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

export function getSupabaseAnonClient(): SupabaseClient {
    if (anonClient) return anonClient;

    const url = requireEnv('SUPABASE_API_URL (or SUPABASE_URL)', getSupabaseUrl());
    const anonKey = requireEnv('SUPABASE_ANON_KEY', getSupabaseAnonKey());

    anonClient = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    });

    return anonClient;
}

export function getSupabaseServiceClient(): SupabaseClient {
    if (serviceClient) return serviceClient;

    const url = requireEnv('SUPABASE_API_URL', getSupabaseUrl());
    const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY', env.SUPABASE_SERVICE_ROLE_KEY);

    serviceClient = createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    });

    return serviceClient;
}
