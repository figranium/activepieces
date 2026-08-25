import { Property } from '@activepieces/pieces-framework';
import { figraniumAuth } from '../auth';
import { getFigraniumClient } from './client';

export const taskIdDropdown = Property.Dropdown({
  displayName: 'Task',
  description: 'The task to execute',
  required: true,
  refreshers: ['auth'],
  auth: figraniumAuth,
  options: async ({ auth }) => {
    if (!auth) {
      return {
        disabled: true,
        placeholder: 'Please connect your Figranium account first',
        options: [],
      };
    }
    const client = getFigraniumClient(auth.props);
    const response = await client.tasks.listSummaries();
    return {
      disabled: false,
      options: response.tasks.map((task) => ({
        label: task.name || task.id,
        value: task.id,
      })),
    };
  },
});
