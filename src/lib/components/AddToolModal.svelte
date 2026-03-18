<script lang="ts">
    import type { ToolFormData } from "$lib/types/tool";

    interface Props {
        onsubmit: (data: ToolFormData) => void;
        onclose: () => void;
    }

    let { onsubmit, onclose }: Props = $props();

    let name = $state("");
    let description = $state("");
    let details = $state("");
    let category = $state("");
    let url = $state("");
    let coverImage = $state("");
    let tagsRaw = $state("");
    let errors = $state<Record<string, string>>({});

    function validate(): boolean {
        const next: Record<string, string> = {};

        if (!name.trim()) next.name = "El nombre es obligatorio";
        if (!description.trim())
            next.description = "La descripción es obligatoria";
        if (!details.trim()) next.details = "Los detalles son obligatorios";
        if (!url.trim()) next.url = "La URL es obligatoria";
        else if (!/^https?:\/\/.+/.test(url.trim()))
            next.url = "Introduce una URL válida";

        errors = next;
        return Object.keys(next).length === 0;
    }

    function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (!validate()) return;

        const tags = tagsRaw
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean);

        onsubmit({
            name: name.trim(),
            description: description.trim(),
            details: details.trim(),
            category: category.trim() || "General",
            url: url.trim(),
            coverImage: coverImage.trim(),
            tags,
        });
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
            <h2 id="modal-title">➕ Añadir herramienta</h2>
            <button
                class="close-btn"
                onclick={onclose}
                aria-label="Cerrar modal"
            >
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
            <!-- Name -->
            <div class="field" class:has-error={errors.name}>
                <label for="field-name"
                    >Nombre <span class="required">*</span></label
                >
                <input
                    id="field-name"
                    type="text"
                    bind:value={name}
                    placeholder="Ej. ChatGPT"
                />
                {#if errors.name}<span class="error-msg">{errors.name}</span
                    >{/if}
            </div>

            <!-- URL -->
            <div class="field" class:has-error={errors.url}>
                <label for="field-url"
                    >URL <span class="required">*</span></label
                >
                <input
                    id="field-url"
                    type="url"
                    bind:value={url}
                    placeholder="https://..."
                />
                {#if errors.url}<span class="error-msg">{errors.url}</span>{/if}
            </div>

            <!-- Description -->
            <div class="field" class:has-error={errors.description}>
                <label for="field-desc"
                    >Descripción corta <span class="required">*</span></label
                >
                <input
                    id="field-desc"
                    type="text"
                    bind:value={description}
                    placeholder="Breve descripción de la herramienta"
                />
                {#if errors.description}<span class="error-msg"
                        >{errors.description}</span
                    >{/if}
            </div>

            <!-- Details -->
            <div class="field" class:has-error={errors.details}>
                <label for="field-details"
                    >Información detallada <span class="required">*</span
                    ></label
                >
                <textarea
                    id="field-details"
                    rows="3"
                    bind:value={details}
                    placeholder="Qué hace, qué problema resuelve, casos de uso..."
                ></textarea>
                {#if errors.details}<span class="error-msg"
                        >{errors.details}</span
                    >{/if}
            </div>

            <!-- Category & Tags in a row -->
            <div class="field-row">
                <div class="field">
                    <label for="field-category">Categoría</label>
                    <input
                        id="field-category"
                        type="text"
                        bind:value={category}
                        placeholder="IA, YouTube, API..."
                    />
                </div>

                <div class="field">
                    <label for="field-tags"
                        >Tags <span class="hint">(sep. por comas)</span></label
                    >
                    <input
                        id="field-tags"
                        type="text"
                        bind:value={tagsRaw}
                        placeholder="ia, chatbot, texto"
                    />
                </div>
            </div>

            <!-- Cover image (optional) -->
            <div class="field">
                <label for="field-image">
                    Imagen de portada
                    <span class="hint">(opcional — URL)</span>
                </label>
                <input
                    id="field-image"
                    type="url"
                    bind:value={coverImage}
                    placeholder="https://example.com/image.png"
                />
                <p class="field-hint">
                    Si no se indica, se usará un placeholder generado con las
                    iniciales.
                </p>
            </div>

            <div class="modal-actions">
                <button
                    type="button"
                    class="btn btn-secondary"
                    onclick={onclose}>Cancelar</button
                >
                <button type="submit" class="btn btn-primary"
                    >Añadir herramienta</button
                >
            </div>
        </form>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        padding: 1rem;
        animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .modal {
        background: var(--modal-bg);
        border: 1px solid var(--card-border);
        border-radius: 20px;
        width: 100%;
        max-width: 540px;
        max-height: 90vh;
        overflow-y: auto;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        animation: slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
    }

    @keyframes slideUp {
        from {
            transform: translateY(24px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .modal-header h2 {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--color-text);
        margin: 0;
    }

    .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text-muted);
        display: flex;
        align-items: center;
        border-radius: 8px;
        padding: 0.25rem;
        transition:
            color 0.2s,
            background 0.2s;
    }

    .close-btn:hover {
        color: var(--color-text);
        background: var(--card-border);
    }

    .modal-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }

    .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .field label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--color-text);
    }

    .required {
        color: var(--color-primary);
    }

    .hint {
        font-weight: 400;
        color: var(--color-text-muted);
        font-size: 0.78rem;
    }

    .field-hint {
        font-size: 0.75rem;
        color: var(--color-text-muted);
        margin: 0;
    }

    .field input,
    .field textarea {
        background: var(--input-bg);
        border: 1.5px solid var(--card-border);
        border-radius: 10px;
        padding: 0.65rem 0.85rem;
        font-size: 0.9rem;
        color: var(--color-text);
        font-family: inherit;
        transition:
            border-color 0.2s,
            box-shadow 0.2s;
        outline: none;
        resize: vertical;
    }

    .field input:focus,
    .field textarea:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb), 0.15);
    }

    .has-error input,
    .has-error textarea {
        border-color: #e53e3e;
    }

    .error-msg {
        font-size: 0.78rem;
        color: #e53e3e;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding-top: 0.5rem;
    }

    .btn {
        padding: 0.65rem 1.4rem;
        border-radius: 50px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition:
            transform 0.15s ease,
            box-shadow 0.2s ease,
            opacity 0.2s;
        font-family: inherit;
    }

    .btn:hover {
        transform: translateY(-1px);
    }

    .btn-primary {
        background: var(--color-accent);
        color: #fff;
        box-shadow: 0 4px 14px rgba(var(--color-accent-rgb), 0.4);
    }

    .btn-primary:hover {
        box-shadow: 0 6px 20px rgba(var(--color-accent-rgb), 0.5);
    }

    .btn-secondary {
        background: var(--card-border);
        color: var(--color-text-muted);
    }

    .btn-secondary:hover {
        color: var(--color-text);
    }
</style>
