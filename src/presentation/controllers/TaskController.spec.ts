import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import type { FastifyReply } from 'fastify/types/reply.js';
import type { FastifyRequest } from 'fastify/types/request.js';
import type { CreateTaskUseCase } from '../../application/use-cases/create-tasks-use-case/CreateTasksUseCase.js';
import type { GetTasksUseCase } from '../../application/use-cases/get-tasks-use-case/GetTasksUseCase.js';
import { TaskController } from './TaskController.js';

describe('TaskController', () => {
  let controller: TaskController;
  let getTasksUseCaseMock: jest.Mocked<GetTasksUseCase>;
  let createTaskUseCaseMock: jest.Mocked<CreateTaskUseCase>;

  let mockReply: {
    status: jest.Mock;
    send: jest.Mock;
  };

  beforeEach(() => {
    getTasksUseCaseMock = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetTasksUseCase>;

    createTaskUseCaseMock = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateTaskUseCase>;

    controller = new TaskController(getTasksUseCaseMock, createTaskUseCaseMock);

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('handle (GET /tasks)', () => {
    it('deve retornar 401 se o cabeçalho Authorization estiver ausente', async () => {
      const request = {
        headers: {},
      } as FastifyRequest;

      await controller.handle(request, mockReply as unknown as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Acesso negado. Token ausente ou inválido.',
      });
    });

    it('deve retornar 401 se o formato do token não for Bearer', async () => {
      const request = {
        headers: { authorization: 'Basic 123456' },
      } as unknown as FastifyRequest;

      await controller.handle(request, mockReply as unknown as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Acesso negado. Token ausente ou inválido.',
      });
    });

    it('deve retornar 200 com a lista de tarefas se a execução for bem-sucedida', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', status: 'needsAction' },
      ];
      getTasksUseCaseMock.execute.mockResolvedValue(mockTasks);

      const request = {
        headers: { authorization: 'Bearer valid-token' },
      } as unknown as FastifyRequest;

      await controller.handle(request, mockReply as unknown as FastifyReply);

      expect(getTasksUseCaseMock.execute).toHaveBeenCalledWith('valid-token');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(mockTasks);
    });

    it('deve retornar 401 se a API do Google informar token expirado/inválido', async () => {
      getTasksUseCaseMock.execute.mockRejectedValue(
        new Error('Erro ao buscar tarefas no Google: Invalid Credentials (HTTP 401)')
      );

      const request = {
        headers: { authorization: 'Bearer expired-token' },
      } as unknown as FastifyRequest;

      await controller.handle(request, mockReply as unknown as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Invalid Credentials'),
        })
      );
    });

    it('deve retornar 502 se a API do Google falhar na comunicação', async () => {
      getTasksUseCaseMock.execute.mockRejectedValue(
        new Error('Erro ao buscar tarefas no Google: HTTP 500 Internal Server Error')
      );

      const request = {
        headers: { authorization: 'Bearer valid-token' },
      } as unknown as FastifyRequest;

      await controller.handle(request, mockReply as unknown as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(502);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Erro ao buscar tarefas no Google: HTTP 500 Internal Server Error',
      });
    });
  });

  describe('create (POST /tasks)', () => {
    it('deve retornar 401 se o cabeçalho Authorization estiver ausente', async () => {
      const request = {
        headers: {},
        body: { title: 'Nova Tarefa' },
      } as FastifyRequest;

      await controller.create(request, mockReply as unknown as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Acesso negado. Token ausente ou inválido.',
      });
    });

    it('deve retornar 400 se o corpo da requisição estiver ausente ou inválido', async () => {
      const request = {
        headers: { authorization: 'Bearer valid-token' },
        body: null,
      } as unknown as FastifyRequest;

      await controller.create(request, mockReply as unknown as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Corpo da requisição ausente ou inválido.',
      });
    });

    it('deve retornar 400 se o título estiver ausente ou vazio', async () => {
      const request = {
        headers: { authorization: 'Bearer valid-token' },
        body: { title: '   ', notes: 'Alguma nota' },
      } as unknown as FastifyRequest;

      await controller.create(request, mockReply as unknown as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'O título da tarefa é obrigatório.',
      });
    });

    it('deve retornar 201 com a nova tarefa criada em caso de sucesso', async () => {
      const createdTask = {
        id: 'new-id',
        title: 'Estudar Jest',
        notes: 'Escrever testes unitários',
        status: 'needsAction',
      };
      createTaskUseCaseMock.execute.mockResolvedValue(createdTask);

      const request = {
        headers: { authorization: 'Bearer valid-token' },
        body: { title: 'Estudar Jest', notes: 'Escrever testes unitários' },
      } as unknown as FastifyRequest;

      await controller.create(request, mockReply as unknown as FastifyReply);

      expect(createTaskUseCaseMock.execute).toHaveBeenCalledWith('valid-token', {
        title: 'Estudar Jest',
        notes: 'Escrever testes unitários',
      });
      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith(createdTask);
    });

    it('deve retornar 403 se o Google recusar por escopo insuficiente', async () => {
      createTaskUseCaseMock.execute.mockRejectedValue(
        new Error('Erro ao criar tarefa no Google: Insufficient Permission')
      );

      const request = {
        headers: { authorization: 'Bearer valid-token' },
        body: { title: 'Estudar' },
      } as unknown as FastifyRequest;

      await controller.create(request, mockReply as unknown as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(403);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Erro ao criar tarefa no Google: Insufficient Permission',
      });
    });

    it('deve retornar 502 se a API do Google falhar ao criar tarefa', async () => {
      createTaskUseCaseMock.execute.mockRejectedValue(
        new Error('Erro ao criar tarefa no Google: HTTP 503 Service Unavailable')
      );

      const request = {
        headers: { authorization: 'Bearer valid-token' },
        body: { title: 'Estudar' },
      } as unknown as FastifyRequest;

      await controller.create(request, mockReply as unknown as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(502);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Erro ao criar tarefa no Google: HTTP 503 Service Unavailable',
      });
    });
  });
});

