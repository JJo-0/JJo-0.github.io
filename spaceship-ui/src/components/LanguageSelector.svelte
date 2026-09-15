<script lang="ts">
  export let translations: Record<string, string>;
  export let currentLang = 'ko';
</script>
<nav aria-label={currentLang.startsWith('en') ? 'Article languages' : '이 글의 언어판'} class="flex flex-wrap items-center gap-2 mb-6 p-3 bg-secondary/30 rounded-lg border border-border/50" data-language-selector>
  <span class="text-xs font-bold text-muted-foreground mr-1">{currentLang.startsWith('en') ? 'Read in:' : '다른 언어로 읽기:'}</span>
  {#each Object.entries(translations) as [lang, href] (lang)}
    <a {href} hreflang={lang} lang={lang} class="px-3 py-1 text-sm font-bold bg-background text-foreground hover:text-primary border border-border rounded no-underline">
      {lang.startsWith('en') ? 'English' : '한국어'}
    </a>
  {/each}
</nav>
