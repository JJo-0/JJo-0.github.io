<script lang="ts">
  import { SITE } from '@/config';

  interface Props {
    url: string;
  }

  let { url }: Props = $props();
  let copied = $state(false);

  const platforms = [
    {
      name: 'Instagram',
      href: SITE.social.instagram,
      iconPaths: [
        'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z',
        'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z',
        'M17.5 6.5h.01',
      ],
    },
    {
      name: 'Website',
      href: SITE.social.website,
      iconPaths: [
        'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
        'M2 12h20',
        'M12 2a15.3 15.3 0 0 1 0 20',
        'M12 2a15.3 15.3 0 0 0 0 20',
      ],
    },
    {
      name: 'GitHub',
      href: SITE.social.github,
      iconPaths: [
        'M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4',
        'M9 18c-4.51 2-5-2-7-2',
      ],
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };
</script>

<div class="flex flex-col gap-4 py-8 border-t border-border/50">
  <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
    Connect
  </h3>

  <div class="flex items-center gap-2">
    {#each platforms as platform (platform.name)}
      <a
        href={platform.href}
        target="_blank"
        rel="noopener noreferrer"
        class="p-2.5 rounded-xl border border-border hover:bg-accent text-muted-foreground hover:text-primary transition-all duration-300"
        aria-label={`Open ${platform.name}`}
        title={platform.name}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          {#each platform.iconPaths as iconPath}
            <path d={iconPath} />
          {/each}
        </svg>
      </a>
    {/each}

    <button
      onclick={copyToClipboard}
      class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-accent text-muted-foreground hover:text-primary transition-all duration-300"
      aria-label="Copy link"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
      <span class="text-xs font-bold uppercase tracking-widest">
        {copied ? 'Copied!' : 'Copy Link'}
      </span>
    </button>
  </div>
</div>
