export {};

declare global {
  interface Window {
    __MALLOS_ENV?: {
      XAI_API_KEY?: string;
    };
  }
}
