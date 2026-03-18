<script lang="ts">
    let adminPassword = $state("");

    let name = $state("");
    let description = $state("");
    let details = $state("");
    let url = $state("");
    let coverImage = $state("");
    let tagsRaw = $state("");

    let isSaving = $state(false);
    let errorMsg = $state<string | null>(null);
    let successId = $state<string | null>(null);

    function validateHttpUrl(value: string): boolean {
        return /^https?:\/\/.+/i.test(value.trim());
    }

    async function handleInsert(e: SubmitEvent) {
        e.preventDefault();
        errorMsg = null;
        successId = null;

        if (!adminPassword.trim()) return (errorMsg = "Password requerida.");
        if (!name.trim()) return (errorMsg = "El nombre es obligatorio.");
        if (!description.trim())
            return (errorMsg = "La descripción es obligatoria.");
        if (!details.trim()) return (errorMsg = "Los detalles son obligatorios.");
        if (!url.trim()) return (errorMsg = "La URL es obligatoria.");
        if (!validateHttpUrl(url)) return (errorMsg = "URL inválida (http/https).");
        if (coverImage.trim() && !validateHttpUrl(coverImage))
            return (errorMsg = "Cover image inválida (http/https).");

        const tags = tagsRaw
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
            .slice(0, 12);

        isSaving = true;
        try {
            const res = await fetch("/api/admin/devtools", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-password": adminPassword.trim()
                },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    details: details.trim(),
                    url: url.trim(),
                    coverImage: coverImage.trim() || undefined,
                    tags
                })
            });

            const body = (await res.json().catch(() => null)) as
                | { success?: boolean; id?: string; error?: string; details?: string }
                | null;

            if (!res.ok || !body?.success) {
                errorMsg =
                    body?.error ??
                    body?.details ??
                    "No se pudo insertar (revisa el password y la configuración).";
                return;
            }

            successId = body.id ?? null;
            name = "";
            description = "";
            details = "";
            url = "";
            coverImage = "";
            tagsRaw = "";
        } catch (err) {
            console.error("[DevTools] Insert IA failed:", err);
            errorMsg = "No se pudo insertar.";
        } finally {
            isSaving = false;
        }
    }
</script>

<svelte:head>
    <title>New IA • DevTools Directory</title>
</svelte:head>

<main class="shell">
    <header class="header">
        <h1 class="title">New IA</h1>
        <p class="subtitle">
            Inserta directamente en <code>api.devtools</code> con categoría
            <code>IA</code> (ruta protegida por password).
        </p>
    </header>

    <section class="card">
        <form class="form" onsubmit={handleInsert}>
            <div class="field">
                <label for="admin-password">Admin password *</label>
                <input
                    id="admin-password"
                    type="password"
                    bind:value={adminPassword}
                    autocomplete="current-password"
                />
            </div>

            <div class="field">
                <label for="name">Name *</label>
                <input id="name" type="text" bind:value={name} />
            </div>

            <div class="field">
                <label for="url">URL *</label>
                <input id="url" type="url" bind:value={url} placeholder="https://..." />
            </div>

            <div class="field">
                <label for="desc">Description *</label>
                <input id="desc" type="text" bind:value={description} />
            </div>

            <div class="field">
                <label for="details">Details *</label>
                <textarea id="details" rows="4" bind:value={details}></textarea>
            </div>

            <div class="field">
                <label for="cover">Cover image (optional)</label>
                <input
                    id="cover"
                    type="url"
                    bind:value={coverImage}
                    placeholder="https://..."
                />
            </div>

            <div class="field">
                <label for="tags">Tags (comma-separated)</label>
                <input id="tags" type="text" bind:value={tagsRaw} placeholder="ai, llm, dev" />
            </div>

            {#if errorMsg}
                <div class="error" role="alert">{errorMsg}</div>
            {/if}
            {#if successId}
                <div class="success" role="status">
                    Inserted: <code>{successId}</code>
                </div>
            {/if}

            <button class="btn btn-primary" type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Insert IA"}
            </button>
        </form>
    </section>
</main>

<style>
    .shell {
        max-width: 820px;
        margin: 0 auto;
        padding: 2rem 1.25rem 3rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .header {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }

    .title {
        margin: 0;
        font-size: 1.8rem;
        font-weight: 900;
        color: var(--color-text);
    }

    .subtitle {
        margin: 0;
        color: var(--color-text-muted);
        font-size: 0.95rem;
        line-height: 1.35;
    }

    .card {
        background: var(--card-bg);
        border: 2px solid var(--card-border);
        border-radius: 18px;
        padding: 1rem;
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }

    label {
        color: var(--color-text);
        font-weight: 800;
        font-size: 0.85rem;
    }

    input,
    textarea {
        width: 100%;
        padding: 0.75rem 0.85rem;
        border-radius: 14px;
        border: 2px solid var(--card-border);
        background: rgba(255, 255, 255, 0.03);
        color: var(--color-text);
        outline: none;
        font-size: 0.95rem;
    }

    input:focus,
    textarea:focus {
        border-color: var(--color-primary);
    }

    .btn {
        border: none;
        border-radius: 999px;
        padding: 0.75rem 1rem;
        font-weight: 900;
        cursor: pointer;
        width: fit-content;
    }

    .btn-primary {
        background: linear-gradient(
            90deg,
            var(--color-primary),
            var(--color-secondary)
        );
        color: #fff;
    }

    .btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .error {
        border: 1px solid rgba(255, 68, 99, 0.35);
        background: rgba(255, 68, 99, 0.12);
        color: rgba(255, 255, 255, 0.92);
        padding: 0.65rem 0.8rem;
        border-radius: 14px;
        font-size: 0.9rem;
        font-weight: 700;
    }

    .success {
        border: 1px solid rgba(40, 200, 140, 0.35);
        background: rgba(40, 200, 140, 0.1);
        color: rgba(255, 255, 255, 0.92);
        padding: 0.65rem 0.8rem;
        border-radius: 14px;
        font-size: 0.9rem;
        font-weight: 800;
    }
</style>

