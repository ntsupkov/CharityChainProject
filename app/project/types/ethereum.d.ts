export {};

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request?: (...args: any[]) => Promise<any>;
      on?: (event: string, handler: (...params: any[]) => void) => void;
      removeListener?: (event: string, handler: (...params: any[]) => void) => void;
    };
  }
}
