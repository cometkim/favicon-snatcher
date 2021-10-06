import type { DomainMatadata, IconMetadata, ManifestLike } from './types';
import { toAbsoluteUrl, limitedBytesStreamReaderIterator } from './utils';

export async function collectMetadata(domain: string): Promise<DomainMatadata> {
  let endpoint = `https://${domain}`;
  let icons: IconMetadata[] = [];
  try {
    let target = await fetch(endpoint);
    let linkedIconCollector = new LinkedIconCollector(endpoint, icons);
    let manifestIconCollector = new ManifestIconCollector(endpoint, icons);
    let transformer = new HTMLRewriter()
      .on('link[rel="icon"]', linkedIconCollector)
      .on('link[rel="shortcut icon"]', linkedIconCollector)
      .on('link[rel="mask-icon"]', linkedIconCollector)
      .on('link[rel="apple-touch-icon"]', linkedIconCollector)
      .on('link[rel="apple-touch-icon-precomposed"]', linkedIconCollector)
      .on('link[rel="manifest"]', manifestIconCollector)
      ;
    let collectorStream = transformer.transform(target).body;
    if (!collectorStream) {
      throw void 0;
    }
    for await (let _chunk of limitedBytesStreamReaderIterator(collectorStream, 100_000)) {
      // noop
    }
  } catch {
    throw new Error(`Failed to fetch ${endpoint}`);
  }

  return { domain, icons };
}

class LinkedIconCollector {
  #baseUrl: string;
  #bufRef: IconMetadata[];

  constructor(baseUrl: string, bufRef: IconMetadata[]) {
    this.#baseUrl = baseUrl;
    this.#bufRef = bufRef;
  }

  element(element: Element) {
    let src = element.getAttribute('href');
    if (!src) {
      return;
    }
    src = toAbsoluteUrl(src, this.#baseUrl);
    let sizes = element.getAttribute('sizes');
    let type = element.getAttribute('type');
    this.#bufRef.push({
      src,
      ...sizes && { sizes },
      ...type && { type },
    });
  }
}

class ManifestIconCollector {
  #baseUrl: string;
  #bufRef: IconMetadata[];

  constructor(baseUrl: string, bufRef: IconMetadata[]) {
    this.#baseUrl = baseUrl;
    this.#bufRef = bufRef;
  }

  async element(element: Element) {
    let src = element.getAttribute('href');
    if (!src) {
      return;
    }

    let manifestUrl = toAbsoluteUrl(src, this.#baseUrl);
    try {
      let manifestResponse = await fetch(manifestUrl, {
        headers: {
          'Accept': 'application/manifest+json',
        },
      });
      let manifest = await manifestResponse.json() as ManifestLike;
      if (!manifest.icons) {
        return;
      }
      for (let iconLike of manifest.icons) {
        if (!iconLike.src) {
          continue;
        }
        let { src, sizes, type } = iconLike;
        this.#bufRef.push({
          src: toAbsoluteUrl(src, this.#baseUrl),
          ...sizes && { sizes },
          ...type && { type },
        });
      }
    } catch {
      // noop
    }
  }
}
