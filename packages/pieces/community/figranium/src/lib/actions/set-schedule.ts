import { createAction, Property } from '@activepieces/pieces-framework';
import { Schedule } from '@figranium/sdk';
import { figraniumAuth } from '../auth';
import { getFigraniumClient } from '../common/client';
import { buildScheduleBody, scheduleConfigProps, scheduleModeDropdown } from '../common/schedule-props';

export const setScheduleAction = createAction({
  auth: figraniumAuth,
  name: 'set_schedule',
  displayName: 'Set Schedule',
  description: 'Create or update a schedule on a task',
  audience: 'both',
  aiMetadata: {
    description:
      'Creates or updates the schedule on a Figranium task, either as a recurring frequency or a cron expression. Use this to make a task run automatically. Safe to retry since it upserts the schedule for the given task ID.',
    idempotent: true,
  },
  props: {
    taskId: Property.ShortText({
      displayName: 'Task ID',
      description: 'The ID of the task',
      required: true,
    }),
    scheduleEnabled: Property.Checkbox({
      displayName: 'Enabled',
      description: 'Whether the schedule should be active',
      required: false,
      defaultValue: true,
    }),
    scheduleMode: scheduleModeDropdown,
    scheduleConfig: scheduleConfigProps,
  },
  async run(context) {
    const { taskId, scheduleEnabled, scheduleMode, scheduleConfig } = context.propsValue;
    const client = getFigraniumClient(context.auth.props);
    const body = {
      enabled: scheduleEnabled ?? true,
      ...buildScheduleBody({ scheduleMode, scheduleConfig }),
    };
    return client.schedules.set(taskId, body as unknown as Schedule);
  },
});
