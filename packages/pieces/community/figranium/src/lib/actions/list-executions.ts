import { createAction } from '@activepieces/pieces-framework';
import { figraniumAuth } from '../auth';
import { getFigraniumClient } from '../common/client';

export const listExecutionsAction = createAction({
  auth: figraniumAuth,
  name: 'list_executions',
  displayName: 'List Executions',
  description: 'Return a summary of all past task executions',
  audience: 'both',
  aiMetadata: {
    description:
      'Lists a summary of all past Figranium task executions. Use this to check recent run history or find an execution to inspect further. Safe to retry.',
    idempotent: true,
  },
  props: {},
  async run(context) {
    const client = getFigraniumClient(context.auth.props);
    return client.executions.list();
  },
});
