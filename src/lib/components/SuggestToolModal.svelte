<script lang="ts">
    import type { Tool } from "$lib/types/tool";
    import ToolCard from "$lib/components/ToolCard.svelte";

    const CATEGORIES = ["IA", "DevTool", "Docs", "Library", "Tool"] as const;

    interface SuggestionPayload {
        name: string;
        description: string;
        details: string;
        category: (typeof CATEGORIES)[number];
        url?: string;
        cover_image?: string;
        tags: string[];
    }

    interface Props {
        onclose: () => void;
        onsubmitted?: () => void;
    }

    let { onclose, onsubmitted }: Props = $props();

    let name = $state("");
    let description = $state("");
    let details = $state("");
    let category = $state<(typeof CATEGORIES)[number]>("DevTool");
    let url = $state("");
    let coverImage = $state("");
    let tagsRaw = $state("");
    let errors = $state<Record<string, string>>({});
    let isSubmitting = $state(false);
    let submitError = $state<string | null>(null);

    let previewTags: string[] = [];

    let previewTool = $state<Tool>({
        id: "preview",
        addedAt: new Date().toISOString(),
        name: "Nombre de la herramienta",
        description: "Una breve descripción de la herramienta.",
        details: "Más detalles sobre el uso y valor de esta herramienta.",
        category: "DevTool",
        tags: [],
        url: "",
        coverImage: ""
    });

    $effect(() => {
        previewTags = tagsRaw
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
            .slice(0, 12);

        previewTool = {
            id: "preview",
            addedAt: new Date().toISOString(),
            name: name.trim() || "Nombre de la herramienta",
            description: description.trim() || "Una breve descripción de la herramienta.",
            details: details.trim() || "Más detalles sobre el uso y valor de esta herramienta.",
            category,
            tags: previewTags,
            url: url.trim() || "",
            coverImage: coverImage.trim() || ""
        };
    });

    function validate(): boolean {
        const next: Record<string, string> = {};

        if (!name.trim()) next.name = "El nombre es obligatorio";
        if (!description.trim())
            next.description = "La descripción es obligatoria";
        if (!details.trim()) next.details = "Los detalles son obligatorios";
        if (url.trim() && !/^https?:\/\/.+/i.test(url.trim()))
            next.url = "Introduce una URL válida (http/https)";
        if (coverImage.trim() && !/^https?:\/\/.+/i.test(coverImage.trim()))
            next.coverImage = "Introduce una URL válida (http/https)";

        errors = next;
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        submitError = null;
        if (!validate()) return;

        const tags = tagsRaw
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
            .slice(0, 12);

        const payload: SuggestionPayload = {
            name: name.trim(),
            description: description.trim(),
            details: details.trim(),
            category,
            tags
        };

        if (url.trim()) payload.url = url.trim();
        if (coverImage.trim()) payload.cover_image = coverImage.trim();

        isSubmitting = true;
        try {
            const res = await fetch("/api/suggestions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const body = (await res.json().catch(() => null)) as
                | { success?: boolean; error?: string }
                | null;

            if (!res.ok || !body?.success) {
                submitError = body?.error ?? "No se pudo enviar la sugerencia";
                return;
            }

            onsubmitted?.();
            onclose();
        } catch (err) {
            console.error("[DevTools] Suggestion failed:", err);
            submitError = "No se pudo enviar la sugerencia";
        } finally {
            isSubmitting = false;
        }
    }

    function handleBackdropClick(e: MouseEvent) {
        if ((e.target as HTMLElement).classList.contains("modal-backdrop")) {
            onclose();
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") onclose();
    }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="modal-backdrop"
    onclick={handleBackdropClick}
    role="dialog"
    tabindex="-1"
    aria-modal="true"
    aria-labelledby="modal-title"
>
    <div class="modal">
        <div class="modal-header">
            <h2 id="modal-title">💡 Sugerir una devtool</h2>
            <button class="close-btn" onclick={onclose} aria-label="Cerrar modal">
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>

        <form class="modal-form" onsubmit={handleSubmit} novalidate>
            {#if submitError}
                <div class="submit-error" role="alert">{submitError}</div>
            {/if}

            <div class="field" class:has-error={errors.name}>
                <label for="field-name"
                    >Nombre <span class="required">*</span></label
                >
                <input
                    id="field-name"
                    type="text"
                    bind:value={name}
                    placeholder="Ej. Postman, Supabase, Cursor..."
                />
                {#if errors.name}<span class="error-msg">{errors.name}</span
                    >{/if}
            </div>

            <div class="field-row">
                <div class="field">
                    <label for="field-category"
                        >Categoría <span class="required">*</span></label
                    >
                    <select id="field-category" bind:value={category}>
                        {#each CATEGORIES as c}
                            <option value={c}>{c}</option>
                        {/each}
                    </select>
                </div>

                <div class="field" class:has-error={errors.url}>
                    <label for="field-url"
                        >Link <span class="hint">(opcional)</span></label
                    >
                    <input
                        id="field-url"
                        type="url"
                        bind:value={url}
                        placeholder="https://..."
                    />
                    {#if errors.url}<span class="error-msg">{errors.url}</span
                        >{/if}
                </div>

                <div class="field" class:has-error={errors.coverImage}>
                    <label for="field-cover" >Imagen (URL) <span class="hint">(opcional)</span></label>
                    <input
                        id="field-cover"
                        type="url"
                        bind:value={coverImage}
                        placeholder="https://..."
                    />
                    {#if errors.coverImage}
                        <span class="error-msg">{errors.coverImage}</span>
                    {/if}
                </div>
            </div>

            <div class="field" class:has-error={errors.description}>
                <label for="field-desc"
                    >Descripción corta <span class="required">*</span></label
                >
                <input
                    id="field-desc"
                    type="text"
                    bind:value={description}
                    placeholder="Qué es y por qué es útil"
                />
                {#if errors.description}<span class="error-msg"
                        >{errors.description}</span
                    >{/if}
            </div>

            <div class="field" class:has-error={errors.details}>
                <label for="field-details"
                    >Detalles <span class="required">*</span></label
                >
                <textarea
                    id="field-details"
                    rows="4"
                    bind:value={details}
                    placeholder="Casos de uso, por qué debería estar en la lista, etc."
                ></textarea>
                {#if errors.details}<span class="error-msg">{errors.details}</span
                    >{/if}
            </div>

            <div class="field">
                <label for="field-tags"
                    >Tags <span class="hint">(sep. por comas)</span></label
                >
                <input
                    id="field-tags"
                    type="text"
                    bind:value={tagsRaw}
                    placeholder="api, devtool, productivity"
                />
            </div>

            <div class="preview-section" aria-label="Vista previa de la tarjeta">
                <h3 class="preview-title">Vista previa</h3>
                <p class="preview-sub">
                    Así se verá la tarjeta al enviarla (solo es una vista previa, no se guarda hasta enviar).
                </p>
                <div class="preview-card">
                    <ToolCard tool={previewTool} />
                </div>
            </div>

            <div class="modal-actions">
                <button
                    type="button"
                    class="btn btn-secondary"
                    disabled={isSubmitting}
                    onclick={onclose}>Cancelar</button
                >
                <button type="submit" class="btn btn-primary" disabled={isSubmitting}
                    >{isSubmitting ? "Enviando..." : "Enviar sugerencia"}</button
                >
            </div>
        </form>
    </div>
</div>

<style>
    /* Reuse the visual language from AddToolModal with a few extras */
    .modal-backdrop {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        background: rgba(0, 0, 0, 0.55);
        z-index: 50;
        padding: 1.25rem;
        overflow-y: auto;
    }

    .modal {
        width: min(720px, 100%);
        max-height: calc(100dvh - 2.5rem);
        background: var(--card-bg);
        border: 2px solid var(--card-border);
        border-radius: 18px;
        box-shadow: 0 30px 90px rgba(0, 0, 0, 0.45);
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        border-bottom: 1px solid var(--card-border);
        position: sticky;
        top: 0;
        background: var(--card-bg);
        z-index: 2;
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 900;
        color: var(--color-text);
    }

    .close-btn {
        background: transparent;
        border: none;
        color: var(--color-text-muted);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 10px;
    }

    .close-btn:hover {
        background: rgba(var(--color-accent-rgb), 0.12);
        color: var(--color-text);
    }

    .modal-form {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        overflow: auto;
        min-height: 0;
    }

    .submit-error {
        border: 1px solid rgba(255, 68, 99, 0.35);
        background: rgba(255, 68, 99, 0.12);
        color: rgba(255, 255, 255, 0.92);
        padding: 0.7rem 0.85rem;
        border-radius: 14px;
        font-size: 0.9rem;
        font-weight: 600;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.65rem;
    }

    .preview-section {
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 16px;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.03);
        display: grid;
        gap: 0.75rem;
    }

    .preview-title {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--color-text);
    }

    .preview-sub {
        margin: 0;
        font-size: 0.82rem;
        color: var(--color-text-muted);
    }

    .preview-card {
        width: 100%;
        max-width: 420px;
        margin: 0 auto;
    }

    @media (max-width: 720px) {
        .field-row {
            grid-template-columns: 1fr;
        }
    }

    label {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--color-text);
    }

    .required {
        color: rgba(255, 68, 99, 0.9);
    }

    .hint {
        font-weight: 600;
        color: var(--color-text-muted);
        margin-left: 0.2rem;
    }

    input,
    textarea,
    select {
        width: 100%;
        padding: 0.75rem 0.85rem;
        border-radius: 14px;
        border: 2px solid var(--card-border);
        background: rgba(255, 255, 255, 0.03);
        color: var(--color-text);
        outline: none;
        font-size: 0.95rem;
        transition: border-color 0.2s ease;
    }

    input:focus,
    textarea:focus,
    select:focus {
        border-color: var(--color-primary);
    }

    .has-error input,
    .has-error textarea {
        border-color: rgba(255, 68, 99, 0.55);
    }

    .error-msg {
        font-size: 0.8rem;
        color: rgba(255, 68, 99, 0.95);
        font-weight: 700;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.6rem;
        padding-top: 0.25rem;
        position: sticky;
        bottom: 0;
        background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0),
            rgba(0, 0, 0, 0.08)
        );
        padding-bottom: 0.3rem;
        z-index: 1;
    }

    .btn {
        border: none;
        border-radius: 999px;
        padding: 0.7rem 1rem;
        font-weight: 800;
        cursor: pointer;
    }

    .btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .btn-secondary {
        background: rgba(255, 255, 255, 0.08);
        color: var(--color-text);
        border: 1px solid rgba(255, 255, 255, 0.14);
    }

    .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.12);
    }

    .btn-primary {
        background: linear-gradient(
            90deg,
            var(--color-primary),
            var(--color-secondary)
        );
        color: white;
        box-shadow: 0 10px 30px rgba(var(--color-accent-rgb), 0.3);
    }

    .btn-primary:hover {
        filter: brightness(1.04);
    }
</style>
