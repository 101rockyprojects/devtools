<script lang="ts">
    import type { PageData } from "./$types";
    import type { Tool } from "$lib/types/tool";
    import ToolCard from "$lib/components/ToolCard.svelte";
    import SearchBar from "$lib/components/SearchBar.svelte";
    import SuggestToolModal from "$lib/components/SuggestToolModal.svelte";
    import { filterTools } from "$lib/stores/tools";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();

    let tools = $derived<Tool[]>(data.tools);
    let searchQuery = $state("");
    let isSuggestModalOpen = $state(false);
    let toast = $state<string | null>(null);

    let filteredTools = $derived(filterTools(tools, searchQuery));

    function openSuggestModal() {
        isSuggestModalOpen = true;
    }

    function closeSuggestModal() {
        isSuggestModalOpen = false;
    }

    function showToast(message: string) {
        toast = message;
        setTimeout(() => {
            toast = null;
        }, 4500);
    }
</script>

<svelte:head>
    <meta name="author" content="Rocky Barrios" />
    <meta name="robots" content="index,follow" />
    <meta name="theme-color" content="#00a8b5" />

    <link rel="canonical" href="https://101rockyprojects.github.io/devtools" />
    <link rel="icon" type="image/webp" href="https://101rockyprojects.github.io/devtools/icon.webp" />

    <meta property="og:title" content="DevTools Directory" />
    <meta property="og:description" content="Herramientas web e IA para desarrolladores" />
    <meta property="og:url" content="https://101rockyprojects.github.io/devtools" />
    <meta property="og:image" content="https://101rockyprojects.github.io/devtools/og-image.webp" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="DevTools Directory" />
    <meta property="og:locale" content="es_ES" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="DevTools Directory" />
    <meta name="twitter:description" content="Herramientas web e IA para desarrolladores" />
    <meta name="twitter:image" content="https://101rockyprojects.github.io/devtools/og-image.webp" />

    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Rocky Barrios",
        "jobTitle": "Backend Developer",
        "url": "https://101rockyprojects.github.io/portafolio/",
        "sameAs": [
          "https://www.linkedin.com/in/rockydev101/",
          "https://github.com/101rockyprojects"
        ]
      }
    </script>

</svelte:head>

<!-- ===== BACKGROUND GRADIENT ===== -->
<div class="bg-gradient" aria-hidden="true"></div>

<!-- ===== MAIN LAYOUT ===== -->
<main class="page">
    <!-- Header -->
    <header class="page-header">
        <div class="header-brand">
            <div class="brand-icon" aria-hidden="true">
                <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <polygon
                        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                    />
                </svg>
            </div>
            <div>
                <h1 class="brand-title">
                    DevTools <span class="brand-accent">Directory</span>
                </h1>
                <p class="brand-sub">
                    Herramientas web e IA para desarrolladores
                </p>
            </div>
        </div>
    </header>

    <!-- Controls row -->
    <section class="controls" aria-label="Búsqueda y acciones">
        <SearchBar query={searchQuery} onchange={(v) => (searchQuery = v)} />

        <button
            id="suggest-tool-btn"
            class="btn-add"
            onclick={openSuggestModal}
            aria-label="Sugerir una herramienta"
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
            >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Sugerir devtool
        </button>

        <!-- Results count -->
        <div class="results-meta" aria-live="polite">
            {filteredTools.length} resultado{filteredTools.length !== 1
                ? "s"
                : ""}
        </div>
    </section>

    <!-- Grid -->
    {#if filteredTools.length > 0}
        <section class="tools-grid" aria-label="Herramientas">
            {#each filteredTools as tool (tool.id)}
                <ToolCard {tool} />
            {/each}
        </section>
    {:else}
        <div class="empty-state" role="status">
            <div class="empty-icon" aria-hidden="true">🔍</div>
            <p class="empty-title">Sin resultados</p>
            <p class="empty-sub">
                Prueba con otro término o sugiere una nueva herramienta.
            </p>
            <button class="btn-add" onclick={openSuggestModal}
                >Sugerir devtool</button
            >
        </div>
    {/if}

    <hr aria-hidden="true" class="divider" />
    
    <footer class="page-footer">
        <p>
            Hecho con ❤️ por
            <a href="https://101rockyprojects.github.io/portafolio/" target="_blank" rel="noopener"
                >Rocky Barrios</a
            >.
        </p>
        <p>
            Más información sobre este proyecto en 
            <a href="https://github.com/101rockyprojects/devtools" target="_blank" rel="noopener"
                >GitHub</a            >.
        </p>
    </footer>
</main>

{#if toast}
    <div class="toast" role="status" aria-live="polite">{toast}</div>
{/if}

<!-- Suggest Tool Modal -->
{#if isSuggestModalOpen}
    <SuggestToolModal
        onclose={closeSuggestModal}
        onsubmitted={() => showToast("¡Gracias! Tu sugerencia fue enviada.")}
    />
{/if}

<style>
    /* === Background decorative gradient === */
    .bg-gradient {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background: radial-gradient(
                ellipse 60% 40% at 15% -5%,
                rgba(125, 26, 53, 0.22) 0%,
                transparent 65%
            ),
            radial-gradient(
                ellipse 50% 35% at 85% 5%,
                rgba(108, 61, 171, 0.18) 0%,
                transparent 60%
            ),
            radial-gradient(
                ellipse 40% 30% at 50% 100%,
                rgba(15, 168, 158, 0.06) 0%,
                transparent 55%
            );
    }

    /* === Page shell === */
    .page {
        position: relative;
        z-index: 1;
        max-width: 1280px;
        margin: 0 auto;
        padding: 2rem 1.5rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.75rem;
    }

    /* === Header === */
    .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .header-brand {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .brand-icon {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        background: linear-gradient(
            135deg,
            var(--color-primary),
            var(--color-secondary)
        );
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        box-shadow: 0 8px 24px rgba(94, 0, 39, 0.4);
        flex-shrink: 0;
    }

    .brand-title {
        font-size: 1.7rem;
        font-weight: 900;
        color: var(--color-text);
        letter-spacing: -0.03em;
        line-height: 1;
    }

    .brand-accent {
        background: linear-gradient(
            90deg,
            var(--color-primary-light),
            var(--color-secondary-light)
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .brand-sub {
        font-size: 0.85rem;
        color: var(--color-text-muted);
        margin-top: 0.25rem;
    }

    /* === Controls row === */
    .controls {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
    }

    /* === Results meta === */
    .results-meta {
        width: 100%;
        font-size: 0.82rem;
        color: var(--color-text-muted);
    }

    /* === Add button === */
    .btn-add {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.65rem 1.3rem;
        border-radius: var(--radius-btn);
        border: none;
        background: var(--color-accent);
        color: #fff;
        font-size: 0.9rem;
        font-weight: 700;
        cursor: pointer;
        font-family: inherit;
        white-space: nowrap;
        transition:
            transform 0.18s ease,
            box-shadow 0.2s ease;
        box-shadow: 0 4px 18px rgba(var(--color-accent-rgb), 0.38);
    }

    .btn-add:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 28px rgba(var(--color-accent-rgb), 0.5);
    }

    .btn-add:active {
        transform: translateY(0);
    }

    /* === Tools grid === */
    .tools-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.25rem;
    }

    /* === Empty state === */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 5rem 1rem;
        text-align: center;
    }

    .empty-icon {
        font-size: 3rem;
        filter: grayscale(0.3);
    }

    .empty-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--color-text);
    }

    .empty-sub {
        font-size: 0.88rem;
        color: var(--color-text-muted);
        max-width: 320px;
        margin-bottom: 0.5rem;
    }

    .divider {
        opacity: 0.2;
        margin: 0;
    }

    .page-footer {
        text-align: end;
        font-size: 0.9rem;
        color: var(--color-text-muted);
        padding: 0rem 1rem 1.25rem;
    }

    .page-footer a {
        color: var(--color-text);
        font-weight: 600;
    }

    .page-footer a:hover {
        color: var(--color-primary);
        font-weight: 600;
    }

    /* === Responsive === */
    @media (max-width: 600px) {
        .page {
            padding: 1.5rem 1rem 3rem;
        }

        .brand-title {
            font-size: 1.35rem;
        }

        .tools-grid {
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
    }

    .toast {
        position: fixed;
        right: 1rem;
        bottom: 1rem;
        z-index: 60;
        padding: 0.85rem 1rem;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: rgba(255, 255, 255, 0.95);
        font-weight: 800;
        font-size: 0.9rem;
        backdrop-filter: blur(8px);
        box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
    }
</style>
