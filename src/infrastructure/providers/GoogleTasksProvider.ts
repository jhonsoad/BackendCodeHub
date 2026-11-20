import type { CreateTaskDTO, Task } from "../../domain/entities/Task.js";
import type { ITasksProvider } from "../../domain/interfaces/ITasksProvider.js";

export class GoogleTasksProvider implements ITasksProvider {
  async fetchTasks(accessToken: string): Promise<Task[]> {
    const url = "https://tasks.googleapis.com/tasks/v1/lists/@default/tasks";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      const message =
        errorData.error?.message || `HTTP ${response.status} ${response.statusText}`;
      throw new Error(`Erro ao buscar tarefas no Google: ${message}`);
    }

    const data = (await response.json()) as { items?: any[] };
    const items = data.items || [];

    return items.map((item: any) => ({
      id: item.id,
      title: item.title,
      notes: item.notes,
      status: item.status,
    }));
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
      const errorData = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      throw new Error(
        `Erro ao criar tarefa no Google: ${errorData.error?.message || `HTTP ${response.status} ${response.statusText}`}`,
      );
    }

    const item = (await response.json()) as any;

    return {
      id: item.id,
      title: item.title,
      notes: item.notes,
      status: item.status,
    };
  }
}
