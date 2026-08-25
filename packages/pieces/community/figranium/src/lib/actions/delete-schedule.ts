import { createAction, Property } from '@activepieces/pieces-framework';
import { figraniumAuth } from '../auth';
import { getFigraniumClient } from '../common/client';

export const deleteScheduleAction = createAction({
  auth: figraniumAuth,
  name: 'delete_schedule',
  displayName: 'Delete Schedule',
  description: 'Disable and remove the schedule from a task',
  audience: 'both',
  aiMetadata: {
    description:
      'Disables and removes the schedule from a Figranium task, stopping it from running automatically. The task itself is not deleted. Retrying after success typically errors since the schedule no longer exists.',
    idempotent: false,
  },
  props: {
    taskId: Property.ShortText({
      displayName: 'Task ID',
      description: 'The ID of the task',
      required: true,
    }),
  },
  async run(context) {
    const { taskId } = context.propsValue;
    const client = getFigraniumClient(context.auth.props);
    return client.schedules.delete(taskId);
  },
});
