export type DomainMatadata = {
  domain: string,
  icons: IconMetadata[],
};

export type IconMetadata = {
  src: string,
  sizes?: string,
  type?: string,
};

export type ManifestLike = {
  icons?: Array<Partial<IconMetadata>>,
};
