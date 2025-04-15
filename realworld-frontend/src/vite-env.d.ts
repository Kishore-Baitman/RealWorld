/// <reference types="vite/client" />

interface Window {
  Cypress?: any;
  handleFromCypress?: (request: any) => any;
}

declare const process: {
  env: {
    NODE_ENV: string;
    [key: string]: string;
  };
}; 