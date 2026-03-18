<script lang="ts">
	import type { Tool } from "$lib/types/tool";
	import { safeExternalHttpUrl } from "$lib/utils/url";

	interface Props {
		tool: Tool;
		ondelete?: (id: string) => void;
	}

	let { tool, ondelete }: Props = $props();

	const PLACEHOLDER_GRADIENT = "from-burgundy to-purple";
	const safeHref = $derived(safeExternalHttpUrl(tool.url));
	const safeCoverImage = $derived(
		tool.coverImage ? safeExternalHttpUrl(tool.coverImage) : null
	);

	/** Returns initials from the tool name for the placeholder card. */
	function getInitials(name: string): string {
		return name
			.split(" ")
			.slice(0, 2)
			.map((w) => w[0])
			.join("")
			.toUpperCase();
	}
</script>

<a
	href={safeHref ?? "#"}
	target={safeHref ? "_blank" : undefined}
	rel={safeHref ? "noopener noreferrer" : undefined}
	class="tool-card"
	aria-label="Open {tool.name}"
>
	<!-- Thumbnail -->
	<div class="card-thumb">
		{#if safeCoverImage}
			<img
				src={safeCoverImage}
				alt="{tool.name} cover"
				class="thumb-img"
			/>
		{:else}
			<div class="thumb-placeholder">
				<span class="initials">{getInitials(tool.name)}</span>
			</div>
		{/if}

		<!-- Hover overlay with details -->
		<div class="card-overlay" aria-hidden="true">
			<p class="overlay-details">{tool.details}</p>

			<div class="overlay-tags">
				{#each tool.tags.slice(0, 4) as tag}
					<span class="tag">#{tag}</span>
				{/each}
			</div>
		</div>
	</div>

	<!-- Card footer (always visible) -->
	<div class="card-footer">
		<span class="card-category">{tool.category}</span>
		<h3 class="card-name">{tool.name}</h3>
		<p class="card-desc">{tool.description}</p>
	</div>
</a>

<style>
	.tool-card {
		display: flex;
		flex-direction: column;
		max-height: 350px;
		border-radius: 16px;
		overflow: hidden;
		background: var(--card-bg);
		border: 2px solid var(--card-border);
		text-decoration: none;
		color: inherit;
		cursor: pointer;
		position: relative;
		transition:
			transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
			box-shadow 0.3s ease,
			border-color 0.3s ease;
	}

	.tool-card:hover {
		transform: translateY(-6px) scale(1.02);
		box-shadow: 0 20px 60px rgba(var(--color-accent-rgb), 0.35);
		border-color: var(--color-primary);
	}

	/* === Thumbnail === */
	.card-thumb {
		position: relative;
		aspect-ratio: 1 / 1;
		overflow: hidden;
	}

	.thumb-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.4s ease;
	}

	.tool-card:hover .thumb-img {
		transform: scale(1.06);
	}

	.thumb-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(
			135deg,
			var(--color-primary),
			var(--color-secondary)
		);
	}

	.initials {
		font-size: 3rem;
		font-weight: 800;
		color: rgba(255, 255, 255, 0.9);
		letter-spacing: 0.05em;
		text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
	}

	/* === Hover overlay === */
	.card-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to bottom,
			rgba(0, 80, 94, 0.85) 0%,
			rgba(21, 3, 104, 0.95) 80%
		);
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding: 1.2rem;
		gap: 0.6rem;
		opacity: 0;
		transition: opacity 0.3s ease;
		backdrop-filter: blur(6px);
	}

	.tool-card:hover .card-overlay {
		opacity: 1;
	}

	.overlay-details {
		flex: 1;
		color: rgba(255, 255, 255, 0.92);
		font-size: 0.85rem;
		font-weight: 500;
		line-height: 1.3;
		margin: 0;
		display: -webkit-box;
		line-clamp: 5;
		-webkit-line-clamp: 5;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.overlay-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.tag {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text);
		background: rgba(var(--color-accent-rgb), 0.5);
		border-radius: 99px;
		padding: 0.15rem 0.55rem;
		border: 1px solid rgba(255, 255, 255, 0.15);
	}

	/* === Footer === */
	.card-footer {
		padding: 1rem 1.1rem 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.card-category {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-primary-light);
	}

	.card-name {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 800;
		color: var(--color-text);
		line-height: 1.3;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.card-desc {
		margin: 0;
		font-size: 0.85rem;
		color: var(--color-text-muted);
		line-height: 1.3;
		display: -webkit-box;
		line-clamp: 3;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
