import type { Handler } from 'worktop';

type RequestParams = {
  domain: string,
  type?: string,
  size?: string,
};

export const icon: Handler<RequestParams> = async (req, res) => {
  let { domain, type, size } = req.params;
  // TODO
};
