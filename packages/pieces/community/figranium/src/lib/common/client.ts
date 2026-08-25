import { Figranium } from '@figranium/sdk';

export type FigraniumAuthValue = {
  baseUrl: string;
  apiKey: string;
};

export function getFigraniumClient(auth: FigraniumAuthValue): Figranium {
  return new Figranium({
    baseUrl: auth.baseUrl,
    apiKey: auth.apiKey,
    apiKeyHeader: 'x-api-key',
  });
}
