type AstroPreparationEvent = Event & {
  direction?: 'forward' | 'backward';
};

type AstroBeforeSwapEvent = Event & {
  newDocument: Document;
};

type TransitionRuntimeHandle = {
  destroy: () => void;
};

declare global {
  interface Window {
    __jjoTransitionRuntime?: TransitionRuntimeHandle;
  }
}

const TITLE_SELECTOR = '[data-post-transition-title]';
const LINK_SELECTOR = 'a[data-post-transition-slug]';
const STORAGE_KEY = 'jjo-post-transition-slug';

function transitionName(slug: string): string {
  return `post-title-${slug.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

function clearDynamicNames(documentRoot: Document = document): void {
  documentRoot.querySelectorAll<HTMLElement>(`${TITLE_SELECTOR}:not([data-post-transition-static])`).forEach((title) => {
    title.style.removeProperty('view-transition-name');
  });
}

function markTitle(title: HTMLElement | null, slug: string): void {
  if (!title) return;
  title.style.setProperty('view-transition-name', transitionName(slug));
}

function currentArticleSlug(documentRoot: Document = document): string | null {
  return documentRoot.querySelector<HTMLElement>('[data-post-page-slug]')?.dataset.postPageSlug ?? null;
}

function findIncomingTitle(documentRoot: Document, slug: string): HTMLElement | null {
  const matchingArticle = documentRoot.querySelector<HTMLElement>(
    `[data-post-page-slug="${slug}"] ${TITLE_SELECTOR}`,
  );
  if (matchingArticle) return matchingArticle;

  return documentRoot.querySelector<HTMLElement>(
    `${LINK_SELECTOR}[data-post-transition-slug="${slug}"] ${TITLE_SELECTOR}`,
  );
}

function validInternalLink(link: HTMLAnchorElement, event: MouseEvent): boolean {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (link.target && link.target !== '_self') return false;
  if (link.hasAttribute('download')) return false;

  const destination = new URL(link.href, window.location.href);
  return destination.origin === window.location.origin;
}

export function installTransitionRuntime(): void {
  if (typeof window === 'undefined' || window.__jjoTransitionRuntime) return;

  let pendingSlug: string | null = null;
  let completionTimer = 0;

  const setLoading = (): void => {
    document.documentElement.setAttribute('data-route-loading', '');
    document.documentElement.removeAttribute('data-route-ready');
  };

  const clearLoading = (): void => {
    window.clearTimeout(completionTimer);
    document.documentElement.setAttribute('data-route-ready', '');
    completionTimer = window.setTimeout(() => {
      document.documentElement.removeAttribute('data-route-loading');
      document.documentElement.removeAttribute('data-route-ready');
      document.documentElement.removeAttribute('data-navigation-direction');
    }, 220);
  };

  const onClick = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const link = target.closest<HTMLAnchorElement>(LINK_SELECTOR);
    if (!link || !validInternalLink(link, event)) return;

    const slug = link.dataset.postTransitionSlug;
    const title = link.querySelector<HTMLElement>(TITLE_SELECTOR);
    if (!slug || !title) return;

    clearDynamicNames();
    markTitle(title, slug);
    pendingSlug = slug;
    sessionStorage.setItem(STORAGE_KEY, slug);
  };

  const onBeforePreparation = (event: Event): void => {
    const navigationEvent = event as AstroPreparationEvent;
    document.documentElement.dataset.navigationDirection = navigationEvent.direction ?? 'forward';
    setLoading();
  };

  const onAfterPreparation = (): void => {
    document.documentElement.setAttribute('data-route-ready', '');
  };

  const onBeforeSwap = (event: Event): void => {
    const swapEvent = event as AstroBeforeSwapEvent;
    const slug =
      pendingSlug ??
      currentArticleSlug() ??
      sessionStorage.getItem(STORAGE_KEY);

    swapEvent.newDocument.documentElement.dataset.navigationDirection =
      document.documentElement.dataset.navigationDirection ?? 'forward';

    if (!slug) return;

    clearDynamicNames(swapEvent.newDocument);
    markTitle(findIncomingTitle(swapEvent.newDocument, slug), slug);
  };

  const onPageLoad = (): void => {
    clearLoading();
    pendingSlug = null;
  };

  const destroy = (): void => {
    window.clearTimeout(completionTimer);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('astro:before-preparation', onBeforePreparation);
    document.removeEventListener('astro:after-preparation', onAfterPreparation);
    document.removeEventListener('astro:before-swap', onBeforeSwap);
    document.removeEventListener('astro:page-load', onPageLoad);
    window.__jjoTransitionRuntime = undefined;
  };

  document.addEventListener('click', onClick, true);
  document.addEventListener('astro:before-preparation', onBeforePreparation);
  document.addEventListener('astro:after-preparation', onAfterPreparation);
  document.addEventListener('astro:before-swap', onBeforeSwap);
  document.addEventListener('astro:page-load', onPageLoad);

  window.__jjoTransitionRuntime = { destroy };
  onPageLoad();
}
