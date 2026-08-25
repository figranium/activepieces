import { createAction, Property } from '@activepieces/pieces-framework';
import { figraniumAuth } from '../auth';
import { getFigraniumClient } from '../common/client';
import { taskIdDropdown } from '../common/props';

export const executeTaskAction = createAction({
  auth: figraniumAuth,
  name: 'execute_task',
  displayName: 'Execute Task',
  description: 'Run a saved Figranium task and return its result',
  audience: 'both',
  aiMetadata: {
    description:
      'Runs a saved Figranium browser-automation task and returns its result. Use this to trigger an automation on demand with optional runtime variables. Each call starts a new execution, so retries run the task again.',
    idempotent: false,
  },
  props: {
    taskId: taskIdDropdown,
    variables: Property.Object({
      displayName: 'Variables',
      description: 'Key-value pairs passed into the task at runtime',
      required: false,
    }),
  },
  async run(context) {
    const { taskId, variables } = context.propsValue;
    const client = getFigraniumClient(context.auth.props);
    return client.runTask(taskId, {
      variables: (variables as Record<string, unknown>) ?? {},
    });
  },
});
