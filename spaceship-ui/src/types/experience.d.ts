export {};

declare global {
  interface Window {
    __jjoExperienceRuntime?: {
      cleanup: () => void;
    };
    __jjoExperienceListenersBound?: boolean;
  }
}
