import { PieceAuth, Property } from '@activepieces/pieces-framework';
import { getFigraniumClient } from './common/client';

export const figraniumAuth = PieceAuth.CustomAuth({
  displayName: 'Connection',
  required: true,
  props: {
    baseUrl: Property.ShortText({
      displayName: 'Base URL',
      description: 'Your Figranium server URL, e.g. http://localhost:11345',
      required: true,
      defaultValue: 'http://localhost:11345',
    }),
    apiKey: PieceAuth.SecretText({
      displayName: 'API Key',
      description: 'Generate this from Figranium Settings > API Key.',
      required: true,
    }),
  },
  validate: async ({ auth }) => {
    try {
      const client = getFigraniumClient(auth);
      await client.tasks.listSummaries();
      return { valid: true };
    } catch (e) {
      return {
        valid: false,
        error: 'Could not connect to Figranium. Check the base URL and API key.',
      };
    }
  },
});
