import type { FastifyRequest } from 'fastify/types/request.js';
import type { FastifyReply } from 'fastify/types/reply.js';
import type { GetTasksUseCase } from '../../application/use-cases/get-tasks-use-case/GetTasksUseCase.js';
import type { CreateTaskUseCase } from '../../application/use-cases/create-tasks-use-case/CreateTasksUseCase.js';

export class TaskController {
  constructor(
    private getTasksUseCase: GetTasksUseCase,
    private createTaskUseCase: CreateTaskUseCase
  ) {}

  private extractAccessToken(request: FastifyRequest): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1]?.trim();
    return token || null;
  }

  private handleError(error: unknown, reply: FastifyReply, defaultMessage: string) {
    const message = error instanceof Error ? error.message : defaultMessage;

    if (
      message.includes('Token de acesso é obrigatório') ||
      message.toLowerCase().includes('invalid credentials') ||
      message.toLowerCase().includes('unauthorized') ||
      message.includes('HTTP 401')
    ) {
      return reply.status(401).send({ error: message });
    }

    if (
      message.toLowerCase().includes('insufficient') ||
      message.toLowerCase().includes('forbidden') ||
      message.includes('HTTP 403')
    ) {
      return reply.status(403).send({ error: message });
    }

    if (
      message.includes('obrigatório') ||
      message.includes('inválido') ||
      message.includes('HTTP 400')
    ) {
      return reply.status(400).send({ error: message });
    }

    if (
      message.includes('Erro ao buscar tarefas no Google') ||
      message.includes('Erro ao criar tarefa no Google')
    ) {
      return reply.status(502).send({ error: message });
    }

    return reply.status(500).send({ error: message || defaultMessage });
  }

  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const accessToken = this.extractAccessToken(request);
      if (!accessToken) {
        return reply.status(401).send({ error: 'Acesso negado. Token ausente ou inválido.' });
      }

      const tasks = await this.getTasksUseCase.execute(accessToken);
      return reply.status(200).send(tasks);
    } catch (error: unknown) {
      return this.handleError(error, reply, 'Erro ao buscar tarefas.');
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const accessToken = this.extractAccessToken(request);
      if (!accessToken) {
        return reply.status(401).send({ error: 'Acesso negado. Token ausente ou inválido.' });
      }

      if (!request.body || typeof request.body !== 'object') {
        return reply.status(400).send({ error: 'Corpo da requisição ausente ou inválido.' });
      }

      const body = request.body as Record<string, unknown>;
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      const notes = typeof body.notes === 'string' ? body.notes.trim() : undefined;

      if (!title) {
        return reply.status(400).send({ error: 'O título da tarefa é obrigatório.' });
      }

      const newTask = await this.createTaskUseCase.execute(accessToken, {
        title,
        notes,
      });

      return reply.status(201).send(newTask);
    } catch (error: unknown) {
      return this.handleError(error, reply, 'Erro ao criar tarefa.');
    }
  }
}
