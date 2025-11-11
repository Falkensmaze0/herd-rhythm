declare module 'html5-qrcode' {
  export class Html5Qrcode {
    constructor(elementId: string);
    start(...args: unknown[]): Promise<void>;
    stop(): Promise<void>;
    clear(): Promise<void>;
    // Add more methods if needed
  }
}

// Also declare global if the script is loaded via window.Html5Qrcode
// This pattern enables both import and global usage

declare class Html5Qrcode {
  constructor(elementId: string);
  start(...args: unknown[]): Promise<void>;
  stop(): Promise<void>;
  clear(): Promise<void>;
}
