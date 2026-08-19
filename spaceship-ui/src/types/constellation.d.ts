export {};

declare global {
  interface Window {
    __jjoConstellationCleanup?: () => void;
    __jjoConstellationListenersBound?: boolean;
  }
}
