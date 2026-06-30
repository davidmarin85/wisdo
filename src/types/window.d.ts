// Extend Window with globals injected by Google Tag Manager / Consent Mode
interface Window {
  gtag(...args: unknown[]): void;
  dataLayer: unknown[];
}
