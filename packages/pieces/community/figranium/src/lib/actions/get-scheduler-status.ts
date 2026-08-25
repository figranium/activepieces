import { createAction } from '@activepieces/pieces-framework';
import { figraniumAuth } from '../auth';
import { getFigraniumClient } from '../common/client';

export const getSchedulerStatusAction = createAction({
  auth: figraniumAuth,
  name: 'get_scheduler_status',
  displayName: 'Get Scheduler Status',
  description: 'Return the overall status of the task scheduler',
  audience: 'both',
  aiMetadata: {
    description:
      'Returns the overall status of the Figranium scheduler engine, covering every scheduled task at once. Use this instead of Get Schedule Status when you need a system-wide view rather than a single task. Safe to retry.',
    idempotent: true,
  },
  props: {},
  async run(context) {
    const client = getFigraniumClient(context.auth.props);
    return client.schedules.overallStatus();
  },
});
