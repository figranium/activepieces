import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Figranium } from '@figranium/sdk';
import { getFigraniumClient } from '../src/lib/common/client.ts';
import { executeTaskAction } from '../src/lib/actions/execute-task';
import { listTasksAction } from '../src/lib/actions/list-tasks';
import { listExecutionsAction } from '../src/lib/actions/list-executions';
import { listSchedulesAction } from '../src/lib/actions/list-schedules';
import { getScheduleStatusAction } from '../src/lib/actions/get-schedule-status';
import { getSchedulerStatusAction } from '../src/lib/actions/get-scheduler-status';
import { setScheduleAction } from '../src/lib/actions/set-schedule';
import { deleteScheduleAction } from '../src/lib/actions/delete-schedule';
import { describeScheduleAction } from '../src/lib/actions/describe-schedule';
import { figraniumAuth } from '../src/lib/auth';
import { taskIdDropdown } from '../src/lib/common/props';

describe('Figranium Piece', () => {
  const auth = {
    baseUrl: 'http://localhost:11345',
    apiKey: 'test-api-key',
  };

  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('instantiates Figranium SDK client with correct options', () => {
    const client = getFigraniumClient(auth);
    expect(client).toBeInstanceOf(Figranium);
  });

  it('validates authentication via SDK', async () => {
    fetchMock.mockImplementation(async () => {
      return new Response(JSON.stringify({ tasks: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const result = await figraniumAuth.validate({ auth });
    expect(result).toEqual({ valid: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url.toString()).toContain('/api/tasks/list');
    const headers = new Headers(opts.headers);
    expect(headers.get('x-api-key')).toBe('test-api-key');
  });

  it('handles auth validation error', async () => {
    fetchMock.mockImplementation(async () => {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const result = await figraniumAuth.validate({ auth });
    expect(result).toEqual({
      valid: false,
      error: 'Could not connect to Figranium. Check the base URL and API key.',
    });
  });

  it('populates taskIdDropdown options via SDK', async () => {
    fetchMock.mockImplementation(async () => {
      return new Response(
        JSON.stringify({
          tasks: [
            { id: 'task-1', name: 'Task 1' },
            { id: 'task-2' },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    });

    const result = await taskIdDropdown.options({ auth: { props: auth } } as any);
    expect(result).toEqual({
      disabled: false,
      options: [
        { label: 'Task 1', value: 'task-1' },
        { label: 'task-2', value: 'task-2' },
      ],
    });
  });

  it('executes task via SDK runTask method', async () => {
    fetchMock.mockImplementation(async () => {
      return new Response(JSON.stringify({ executionId: 'exec-1', status: 'completed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const context = {
      auth: { props: auth },
      propsValue: { taskId: 'task-1', variables: { foo: 'bar' } },
    } as any;

    const res = await executeTaskAction.run(context);
    expect(res).toEqual({ executionId: 'exec-1', status: 'completed' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url.toString()).toContain('/tasks/task-1/api');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ variables: { foo: 'bar' } });
  });

  it('lists tasks via SDK listSummaries method', async () => {
    const tasks = [{ id: 't1', name: 'Task 1' }];
    fetchMock.mockImplementation(async () => {
      return new Response(JSON.stringify({ tasks }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const context = { auth: { props: auth }, propsValue: {} } as any;
    const res = await listTasksAction.run(context);
    expect(res).toEqual(tasks);
  });

  it('lists executions via SDK executions.list method', async () => {
    const executions = [{ id: 'exec-1' }];
    fetchMock.mockImplementation(async () => {
      return new Response(JSON.stringify({ executions }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const context = { auth: { props: auth }, propsValue: {} } as any;
    const res = await listExecutionsAction.run(context);
    expect(res).toEqual({ executions });
  });

  it('lists schedules via SDK schedules.list method', async () => {
    const schedules = [{ taskId: 't1' }];
    fetchMock.mockImplementation(async () => {
      return new Response(JSON.stringify({ schedules }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const context = { auth: { props: auth }, propsValue: {} } as any;
    const res = await listSchedulesAction.run(context);
    expect(res).toEqual({ schedules });
  });

  it('gets schedule status via SDK schedules.status method', async () => {
    fetchMock.mockImplementation(async () => {
      return new Response(JSON.stringify({ isValid: true, cron: '0 * * * *' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const context = { auth: { props: auth }, propsValue: { taskId: 't1' } } as any;
    const res = await getScheduleStatusAction.run(context);
    expect(res).toEqual({ isValid: true, cron: '0 * * * *' });
    const [url] = fetchMock.mock.calls[0];
    expect(url.toString()).toContain('/api/schedules/t1/status');
  });

  it('gets scheduler status via SDK schedules.overallStatus method', async () => {
    fetchMock.mockImplementation(async () => {
      return new Response(JSON.stringify({ totalTasks: 5 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const context = { auth: { props: auth }, propsValue: {} } as any;
    const res = await getSchedulerStatusAction.run(context);
    expect(res).toEqual({ totalTasks: 5 });
    const [url] = fetchMock.mock.calls[0];
    expect(url.toString()).toContain('/api/schedules/status/all');
  });

  it('sets schedule via SDK schedules.set method', async () => {
    fetchMock.mockImplementation(async () => {
      return new Response(JSON.stringify({ schedule: { cron: '0 9 * * 1' }, description: 'Every Monday' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const context = {
      auth: { props: auth },
      propsValue: {
        taskId: 't1',
        scheduleEnabled: true,
        scheduleMode: 'cron',
        scheduleConfig: { cronExpression: '0 9 * * 1' },
      },
    } as any;

    const res = await setScheduleAction.run(context);
    expect(res).toEqual({ schedule: { cron: '0 9 * * 1' }, description: 'Every Monday' });
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url.toString()).toContain('/api/schedules/t1');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ enabled: true, cron: '0 9 * * 1' });
  });

  it('deletes schedule via SDK schedules.delete method', async () => {
    fetchMock.mockImplementation(async () => {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const context = { auth: { props: auth }, propsValue: { taskId: 't1' } } as any;
    const res = await deleteScheduleAction.run(context);
    expect(res).toEqual({ success: true });
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url.toString()).toContain('/api/schedules/t1');
    expect(opts.method).toBe('DELETE');
  });

  it('describes schedule via SDK schedules.describe method', async () => {
    fetchMock.mockImplementation(async () => {
      return new Response(JSON.stringify({ valid: true, description: 'Every day' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const context = {
      auth: { props: auth },
      propsValue: {
        taskId: 't1',
        scheduleMode: 'frequency',
        scheduleConfig: { frequency: 'daily', hour: 10, minute: 0 },
      },
    } as any;

    const res = await describeScheduleAction.run(context);
    expect(res).toEqual({ valid: true, description: 'Every day' });
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url.toString()).toContain('/api/schedules/t1/describe');
    expect(opts.method).toBe('POST');
  });
});
