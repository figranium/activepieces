import { createAction } from '@activepieces/pieces-framework';
import { figraniumAuth } from '../auth';
import { getFigraniumClient } from '../common/client';

export const listTasksAction = createAction({
  auth: figraniumAuth,
  name: 'list_tasks',
  displayName: 'List Tasks',
  description: 'Return all task IDs, names, and descriptions',
  audience: 'both',
  aiMetadata: {
    description:
      'Lists all saved tasks on the Figranium server with their IDs, names, and descriptions. Use this to discover which tasks exist before executing one. Safe to retry.',
    idempotent: true,
  },
  props: {},
  async run(context) {
    const client = getFigraniumClient(context.auth.props);
    const response = await client.tasks.listSummaries();
    return response.tasks;
  },
});
