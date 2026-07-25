import type { Task } from "../domain/entities/Task.js";
import type { ITasksProvider } from "../domain/interfaces/ITasksProvider.js";


export class GetTasksUseCase {
  // Recebemos o contrato (interface) via Injeção de Dependência no construtor
  constructor(private tasksProvider: ITasksProvider) {}

  async execute(accessToken: string): Promise<Task[]> {
    if (!accessToken) {
      throw new Error('Token de acesso é obrigatório.');
    }

    // O Use Case não sabe se estamos usando a API do Google ou um banco local.
    // Ele confia no contrato definido pela interface.
    const tasks = await this.tasksProvider.fetchTasks(accessToken);
    
    // Aqui você poderia adicionar outras regras de negócio (ex: filtrar 
    // tarefas concluídas, ordenar, etc). Por enquanto, apenas retornamos.
    return tasks;
  }
}