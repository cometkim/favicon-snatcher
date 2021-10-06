import type { KV } from 'worktop/kv';

declare var STORE: KV.Namespace;
export const store = STORE;

export const getMetaKey = (domain: string) => `meta:${domain}`;
