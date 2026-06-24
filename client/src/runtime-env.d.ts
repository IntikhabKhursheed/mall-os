export {};

declare global {
  interface Window {
    __MALLOS_ENV?: Record<string, never>;
  }
}
