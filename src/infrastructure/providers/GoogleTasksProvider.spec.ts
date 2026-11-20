import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { GoogleTasksProvider } from './GoogleTasksProvider.js';

describe('GoogleTasksProvider', () => {
  let provider: GoogleTasksProvider;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    provider = new GoogleTasksProvider();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  describe('fetchTasks', () => {
    it('deve buscar e mapear a lista de tarefas com sucesso', async () => {
      const mockGoogleResponse = {
        kind: 'tasks#tasks',
        items: [
          {
            id: 'task-1',
            title: 'Tarefa 1',
            notes: 'Notas 1',
            status: 'needsAction',
          },
          {
            id: 'task-2',
            title: 'Tarefa 2',
            notes: undefined,
            status: 'completed',
          },
        ],
      };

      globalThis.fetch = jest.fn<typeof fetch>().mockImplementation(async (url: any, init: any) => {
        expect(url).toBe('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks');
        expect(init?.method).toBe('GET');
        expect(init?.headers?.Authorization).toBe('Bearer test-token');
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => mockGoogleResponse,
        } as unknown as Response;
      });

      const result = await provider.fetchTasks('test-token');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'task-1',
        title: 'Tarefa 1',
        notes: 'Notas 1',
        status: 'needsAction',
      });
      expect(result[1]).toEqual({
        id: 'task-2',
        title: 'Tarefa 2',
        notes: undefined,
        status: 'completed',
      });
    });

    it('deve retornar lista vazia se a propriedade items vier indefinida', async () => {
      globalThis.fetch = jest.fn<typeof fetch>().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ kind: 'tasks#tasks' }),
      } as unknown as Response);

      const result = await provider.fetchTasks('test-token');

      expect(result).toEqual([]);
    });

    it('deve lançar erro descritivo quando a resposta do Google não for ok', async () => {
      globalThis.fetch = jest.fn<typeof fetch>().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({
          error: { message: 'Invalid Credentials' },
        }),
      } as unknown as Response);

      await expect(provider.fetchTasks('invalid-token')).rejects.toThrow(
        'Erro ao buscar tarefas no Google: Invalid Credentials'
      );
    });

    it('deve tratar erro quando a resposta de erro não for um JSON válido', async () => {
      globalThis.fetch = jest.fn<typeof fetch>().mockResolvedValue({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as unknown as Response);

      await expect(provider.fetchTasks('test-token')).rejects.toThrow(
        'Erro ao buscar tarefas no Google: HTTP 502 Bad Gateway'
      );
    });
  });

  describe('createTask', () => {
    it('deve criar e retornar a tarefa com sucesso', async () => {
      const mockCreatedItem = {
        id: 'new-id',
        title: 'Nova Tarefa',
        notes: 'Detalhes da nova tarefa',
        status: 'needsAction',
      };

      globalThis.fetch = jest.fn<typeof fetch>().mockImplementation(async (url: any, init: any) => {
        expect(url).toBe('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks');
        expect(init?.method).toBe('POST');
        expect(init?.headers?.Authorization).toBe('Bearer test-token');
        expect(JSON.parse(init?.body)).toEqual({
          title: 'Nova Tarefa',
          notes: 'Detalhes da nova tarefa',
        });

        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => mockCreatedItem,
        } as unknown as Response;
      });

      const result = await provider.createTask('test-token', {
        title: 'Nova Tarefa',
        notes: 'Detalhes da nova tarefa',
      });

      expect(result).toEqual({
        id: 'new-id',
        title: 'Nova Tarefa',
        notes: 'Detalhes da nova tarefa',
        status: 'needsAction',
      });
    });

    it('deve lançar erro se a criação falhar na API do Google', async () => {
      globalThis.fetch = jest.fn<typeof fetch>().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({
          error: { message: 'Insufficient Permission' },
        }),
      } as unknown as Response);

      await expect(
        provider.createTask('token', { title: 'Tarefa Proibida' })
      ).rejects.toThrow('Erro ao criar tarefa no Google: Insufficient Permission');
    });

    it('deve tratar erro na criação se o retorno não for JSON', async () => {
      globalThis.fetch = jest.fn<typeof fetch>().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Not JSON');
        },
      } as unknown as Response);

      await expect(
        provider.createTask('token', { title: 'Tarefa' })
      ).rejects.toThrow('Erro ao criar tarefa no Google: HTTP 500 Internal Server Error');
    });
  });
});

