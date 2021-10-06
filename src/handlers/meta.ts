import type { Handler } from 'worktop';
import type { Awaited } from '@cometjs/core';
import { collectMetadata } from '../core/collectMetadata';
import * as kv from '../kv';

type RequestParams = {
  domain: string,
};

export const meta: Handler<RequestParams> = async (req, res) => {
  let { domain } = req.params;

  type Metadata = Awaited<ReturnType<typeof collectMetadata>>;
  let metadata: Metadata;

  metadata = await kv.store.get(kv.getMetaKey(domain), 'json') as Metadata;
  if (metadata) {
    res.setHeader('Cache-Control', 'max-age=3600, public');
    return res.send(200, metadata);
  }

  try {
    metadata = await collectMetadata(domain);
  } catch (err) {
    return res.send(500, err);
  }

  try {
    await kv.store.put(
      kv.getMetaKey(domain),
      JSON.stringify(metadata),
      { expirationTtl: 3600 },
    );
  } catch {
    // noop
  }

  res.setHeader('Cache-Control', 'max-age=3600, public');
  return res.send(200, metadata);
};
