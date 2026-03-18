<script lang="ts">
    interface Props {
        query: string;
        onchange: (value: string) => void;
    }

    let { query, onchange }: Props = $props();

    function handleInput(e: Event) {
        onchange((e.target as HTMLInputElement).value);
    }

    function clear() {
        onchange("");
    }
</script>

<div class="search-wrapper">
    <div class="search-bar" class:has-value={query.length > 0}>
        <span class="search-icon" aria-hidden="true">
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
        </span>

        <input
            type="search"
            placeholder="Buscar herramientas..."
            value={query}
            oninput={handleInput}
            id="search-input"
            autocomplete="off"
            spellcheck="false"
            aria-label="Buscar herramientas"
        />

        {#if query}
            <button
                class="clear-btn"
                onclick={clear}
                aria-label="Limpiar búsqueda"
            >
                <svg
                    width="14"
                    height="14"
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
        {/if}
    </div>
</div>

<style>
    .search-wrapper {
        width: 100%;
        max-width: 520px;
    }

    .search-bar {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        background: var(--card-bg);
        border: 1.5px solid var(--card-border);
        border-radius: 50px;
        padding: 0.6rem 1rem;
        transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
    }

    .search-bar:focus-within,
    .search-bar.has-value {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(94, 0, 39, 0.18);
    }

    .search-icon {
        color: var(--color-text-muted);
        display: flex;
        align-items: center;
        flex-shrink: 0;
    }

    input[type="search"] {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        font-size: 0.95rem;
        color: var(--color-text);
        font-family: inherit;
    }

    input[type="search"]::placeholder {
        color: var(--color-text-muted);
    }

    /* Remove native clear button */
    input[type="search"]::-webkit-search-cancel-button {
        display: none;
    }

    .clear-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text-muted);
        display: flex;
        align-items: center;
        padding: 0.15rem;
        border-radius: 50%;
        transition:
            color 0.2s,
            background 0.2s;
    }

    .clear-btn:hover {
        color: var(--color-text);
        background: var(--card-border);
    }
</style>
