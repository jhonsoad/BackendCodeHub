import type { FastifyRequest } from 'fastify/types/request.js';
import type { FastifyReply } from 'fastify/types/reply.js';
import type { GetTasksUseCase } from '../../application/GetTasksUseCase.js';

export class TaskController {
  // Recebemos o Caso de Uso via Injeção de Dependência
  constructor(private getTasksUseCase: GetTasksUseCase) {}

  // O método handle é o que o Fastify vai chamar quando a rota for acessada
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      // 1. Extrair o token do cabeçalho enviado pelo Angular
      // Formato esperado: "Bearer ya29.a0AfB_m..."
      const authHeader = request.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ error: 'Acesso negado. Token ausente ou inválido.' });
      }

      const accessToken = authHeader.split(' ')[1];

      if (!accessToken) {
        return reply.status(401).send({ error: 'Acesso negado. Token ausente ou inválido.' });
      }

      // 2. Chamar a camada de Aplicação (Use Case)
      const tasks = await this.getTasksUseCase.execute(accessToken);

      // 3. Devolver a resposta HTTP de sucesso
      return reply.status(200).send(tasks);

    } catch (error: any) {
      // 4. Lidar com erros (ex: token expirado, erro na API do Google)
      return reply.status(400).send({ error: error.message || 'Erro inesperado' });
    }
  }
}