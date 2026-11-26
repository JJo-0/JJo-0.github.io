<script lang="ts">
  import { onMount } from 'svelte';
  import { uiState } from '@/lib/ui.svelte';
  import { loadSearchIndex, matchSearchRows, SEARCH_PAGE_SIZE } from '@/lib/search-index.mjs';

  type Post = Awaited<ReturnType<typeof loadSearchIndex>>[number];
  let posts = $state.raw<Post[]>([]);
  let query = $state('');
  let limit = $state(SEARCH_PAGE_SIZE);
  let status = $state<'idle' | 'loading' | 'ready' | 'error'>('idle');
  let en = $state(false);
  let live = true;
  let searchInput = $state<HTMLInputElement>();
  let filteredPosts = $derived(matchSearchRows(posts, query));
  let visiblePosts = $derived(filteredPosts.slice(0, limit));

  async function load() {
    status = 'loading';
    try {
      const rows = await loadSearchIndex(document.documentElement.lang);
      if (live) { posts = rows; status = 'ready'; }
    } catch {
      if (live) status = 'error';
    }
  }

  // Opening the dialog alone needs no index download.
  $effect(() => {
    if (query.trim().length && status === 'idle') void load();
  });
  $effect(() => {
    if (uiState.isSearchOpen && searchInput) {
      const timer = setTimeout(() => searchInput?.focus(), 10);
      return () => clearTimeout(timer);
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') uiState.closeSearch();
  }

  onMount(() => {
    en = document.documentElement.lang.toLowerCase().startsWith('en');
    window.addEventListener('keydown', handleKeydown);
    return () => { live = false; window.removeEventListener('keydown', handleKeydown); };
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  data-search-dialog
  class="fixed inset-0 z-[100] flex items-start justify-center pt-8 sm:pt-24 px-4 bg-black/40 backdrop-blur-[4px] transition-all"
  onclick={() => uiState.closeSearch()}
>
  <div
    class="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    onclick={(e) => e.stopPropagation()}
  >
    <div class="flex items-center gap-3 p-4 sm:p-6 border-b border-border bg-background/50">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
      <input
        bind:this={searchInput}
        bind:value={query}
        oninput={() => limit = SEARCH_PAGE_SIZE}
        type="text"
        placeholder="Search post titles or descriptions..."
        class="flex-1 bg-transparent border-none outline-none text-base sm:text-lg text-foreground placeholder:text-muted-foreground/40 font-medium"
      />
      <button
        onclick={() => uiState.closeSearch()}
        class="sm:hidden text-xs font-bold uppercase tracking-widest text-muted-foreground"
      >
        Cancel
      </button>
    </div>

    <div class="max-h-[60vh] sm:max-h-[400px] 3xl:max-h-[600px] overflow-y-auto p-2 sm:p-4">
      {#if query.trim().length === 0}
        <div class="p-12 text-center">
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Start typing to search...
          </p>
        </div>
      {:else if status === 'idle' || status === 'loading'}
        <p class="p-8 text-center text-sm text-muted-foreground" role="status">{en ? 'Loading search index…' : '검색 목록 불러오는 중…'}</p>
      {:else if status === 'error'}
        <div class="p-8 text-center" role="status">
          <p>{en ? 'Search could not load.' : '검색 목록을 불러오지 못했습니다.'}</p>
          <button class="mt-3 rounded-lg border border-border px-4 py-2 text-sm" onclick={() => void load()}>{en ? 'Retry' : '다시 시도'}</button>
        </div>
      {:else if filteredPosts.length === 0}
        <div class="p-12 text-center">
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            No results found for "{query}"
          </p>
        </div>
      {:else}
        <div class="space-y-1">
          {#each visiblePosts as post (post.id)}
            <a
              href={post.href || `/posts/${post.id}`}
              class="block p-4 sm:p-5 rounded-xl hover:bg-accent transition-all no-underline group"
              onclick={() => uiState.closeSearch()}
            >
              <h3
                class="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors mb-1"
              >
                {post.data.title}
              </h3>
              <p class="text-xs sm:text-sm text-muted-foreground line-clamp-1 opacity-80">
                {post.data.description}
              </p>
            </a>
          {/each}
          {#if visiblePosts.length < filteredPosts.length}
            <button data-search-more class="w-full rounded-lg border border-border px-4 py-3 text-sm font-semibold" onclick={() => limit += SEARCH_PAGE_SIZE}>
              {en ? 'Show more' : '더 보기'} ({visiblePosts.length}/{filteredPosts.length})
            </button>
          {/if}
        </div>
      {/if}
    </div>

    <div
      class="hidden sm:flex items-center justify-between px-6 py-3 border-t border-border bg-secondary/30"
    >
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <kbd
            class="px-1.5 py-0.5 text-xs font-bold bg-background border border-border rounded shadow-sm"
            >⏎</kbd
          >
          <span class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >to select</span
          >
        </div>
        <div class="flex items-center gap-2">
          <kbd
            class="px-1.5 py-0.5 text-xs font-bold bg-background border border-border rounded shadow-sm"
            >↑↓</kbd
          >
          <span class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >to navigate</span
          >
        </div>
      </div>
      <div class="flex items-center gap-2">
        <kbd
          class="px-1.5 py-0.5 text-xs font-bold bg-background border border-border rounded shadow-sm"
          >esc</kbd
        >
        <span class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >to close</span
        >
      </div>
    </div>
  </div>
</div>
