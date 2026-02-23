import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills for jose and other environments
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

if (typeof global.structuredClone !== 'function') {
  global.structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));
}

// Fix for Uint8Array in some environments
if (!(global.Uint8Array instanceof Function)) {
  global.Uint8Array = Uint8Array;
}
