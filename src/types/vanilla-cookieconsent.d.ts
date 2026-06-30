// Type shim for vanilla-cookieconsent v3.
// The package ships `export = CookieConsent` (CJS-style), incompatible with
// moduleResolution: Bundler + verbatimModuleSyntax. This shim exposes the
// public API as an ESM default export so `import CC from 'vanilla-cookieconsent'` works.

declare module 'vanilla-cookieconsent' {
  interface CookieValue {
    categories: string[];
    revision: number;
    data: unknown;
    consentId: string;
    consentTimestamp: string;
    lastConsentTimestamp: string;
    expirationTime: number;
  }

  interface UserPreferences {
    acceptType: 'all' | 'custom' | 'necessary';
    acceptedCategories: string[];
    rejectedCategories: string[];
    acceptedServices: Record<string, string[]>;
    rejectedServices: Record<string, string[]>;
  }

  interface ConsentCallbackArg {
    cookie: CookieValue;
    changedCategories?: string[];
    changedServices?: Record<string, string[]>;
  }

  interface AutoClearConfig {
    cookies?: Array<{ name: string | RegExp; path?: string; domain?: string }>;
    reloadPage?: boolean;
  }

  interface CategoryConfig {
    enabled?: boolean;
    readOnly?: boolean;
    autoClear?: AutoClearConfig;
    services?: Record<string, { label?: string; onAccept?: () => void; onReject?: () => void }>;
  }

  type ConsentModalLayout =
    | 'box' | 'box wide' | 'box inline'
    | 'cloud' | 'cloud inline'
    | 'bar' | 'bar inline';

  type ConsentModalPosition =
    | 'top' | 'bottom' | 'middle'
    | 'top left' | 'top center' | 'top right'
    | 'middle left' | 'middle center' | 'middle right'
    | 'bottom left' | 'bottom center' | 'bottom right';

  interface GuiOptions {
    consentModal?: {
      layout?: ConsentModalLayout;
      position?: ConsentModalPosition;
      flipButtons?: boolean;
      equalWeightButtons?: boolean;
    };
    preferencesModal?: {
      layout?: 'box' | 'bar' | 'bar wide';
      position?: 'left' | 'right';
      flipButtons?: boolean;
      equalWeightButtons?: boolean;
    };
  }

  type TranslationRecord = Record<string, unknown>;

  interface CookieConsentConfig {
    root?: string | HTMLElement;
    mode?: 'opt-in' | 'opt-out';
    autoShow?: boolean;
    manageScriptTags?: boolean;
    autoClearCookies?: boolean;
    revision?: number;
    cookie?: {
      name?: string;
      domain?: string;
      path?: string;
      expiresAfterDays?: number | ((acceptType: string) => number);
      sameSite?: 'Lax' | 'Strict' | 'None';
      useLocalStorage?: boolean;
    };
    guiOptions?: GuiOptions;
    onFirstConsent?: (param: ConsentCallbackArg) => void;
    onConsent?: (param: ConsentCallbackArg) => void;
    onChange?: (param: ConsentCallbackArg) => void;
    onModalReady?: (param: { modalName: string }) => void;
    onModalShow?: (param: { modalName: string }) => void;
    onModalHide?: (param: { modalName: string }) => void;
    categories?: Record<string, CategoryConfig>;
    language?: {
      default: string;
      autoDetect?: 'browser' | 'document';
      rtl?: string | string[];
      translations?: Record<string, TranslationRecord | (() => Promise<TranslationRecord>)>;
    };
    disablePageInteraction?: boolean;
  }

  const CookieConsent: {
    run(config: CookieConsentConfig): Promise<void>;
    show(createModal?: boolean): void;
    hide(): void;
    showPreferences(): void;
    hidePreferences(): void;
    acceptCategory(categories: string | string[], excluded?: string[]): void;
    acceptedCategory(categoryName: string): boolean;
    validConsent(): boolean;
    validCookie(cookieName: string): boolean;
    getCookie(): CookieValue;
    getCookie<K extends keyof CookieValue>(field: K): CookieValue[K];
    getConfig(): CookieConsentConfig;
    getUserPreferences(): UserPreferences;
    setLanguage(code: string, force?: boolean): Promise<boolean>;
    reset(eraseCookie?: boolean): void;
  };

  export default CookieConsent;
}
