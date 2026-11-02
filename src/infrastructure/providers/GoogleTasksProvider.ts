import type { CreateTaskDTO, Task } from "../../domain/entities/Task.js";
import type { ITasksProvider } from "../../domain/interfaces/ITasksProvider.js";

export class GoogleTasksProvider implements ITasksProvider {
  fetchTasks(accessToken: string): Promise<Task[]> {
    throw new Error("Method not implemented.");
  }
  async createTask(
    accessToken: string,
    taskData: CreateTaskDTO,
  ): Promise<Task> {
    const url = "https://tasks.googleapis.com/tasks/v1/lists/@default/tasks";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: taskData.title,
        notes: taskData.notes,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Erro ao criar tarefa no Google: ${errorData.error?.message || "Erro desconhecido"}`,
      );
    }

    const item = await response.json();

    return {
      id: item.id,
      title: item.title,
      notes: item.notes,
      status: item.status,
    };
  }
}
