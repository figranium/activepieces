import { createAction } from '@activepieces/pieces-framework';
import { figraniumAuth } from '../auth';
import { getFigraniumClient } from '../common/client';

export const listSchedulesAction = createAction({
  auth: figraniumAuth,
  name: 'list_schedules',
  displayName: 'List Schedules',
  description: 'Return all tasks that have schedules configured',
  audience: 'both',
  aiMetadata: {
    description:
      'Lists every Figranium task that has a schedule configured. Use this to audit which tasks run automatically. Safe to retry.',
    idempotent: true,
  },
  props: {},
  async run(context) {
    const client = getFigraniumClient(context.auth.props);
    return client.schedules.list();
  },
});
