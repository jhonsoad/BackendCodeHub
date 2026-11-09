import type { CreateTaskDTO, Task } from "../../../domain/entities/Task.js";
import type { ITasksProvider } from "../../../domain/interfaces/ITasksProvider.js";

export class CreateTaskUseCase {
  constructor(private tasksProvider: ITasksProvider) {}

  async execute(accessToken: string, taskData: CreateTaskDTO): Promise<Task> {
    if (!accessToken) {
      throw new Error('Token de acesso é obrigatório.');
    }

    if (!taskData.title || taskData.title.trim() === '') {
      throw new Error('O título da tarefa é obrigatório.');
    }

    return await this.tasksProvider.createTask(accessToken, taskData);
  }
}