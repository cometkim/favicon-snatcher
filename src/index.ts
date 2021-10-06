/// <reference types="@cloudflare/workers-types" />

import { Router } from 'worktop';
import * as Cache from 'worktop/cache';
import * as CORS from 'worktop/cors';
import * as handlers from './handlers';

let API = new Router();

API.prepare = CORS.preflight({
  origin: '*',
  headers: ['Cache-Control', 'Content-Type'],
  methods: ['GET', 'HEAD'],
});

API.add('GET', '/meta/:domain', handlers.meta);
API.add('GET', '/icon/:domain', handlers.icon);
API.add('GET', '/icon/:type/:domain', handlers.icon);
API.add('GET', '/icon/:type/:size/:domain', handlers.icon);

Cache.listen(API.run);
