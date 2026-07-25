import type { Task } from "../../domain/entities/Task.js";
import type { ITasksProvider } from "../../domain/interfaces/ITasksProvider.js";

export class GoogleTasksProvider implements ITasksProvider {
  async fetchTasks(accessToken: string): Promise<Task[]> {
    // Chamamos o endpoint do Google que retorna as tarefas da lista padrão (@default)
    const url = 'https://tasks.googleapis.com/tasks/v1/lists/@default/tasks';
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro na API do Google: ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    const items = data.items || [];
    
    // Convertemos o formato do Google para a nossa Entidade limpa
    return items.map((item: any) => ({
      id: item.id,
      title: item.title,
      notes: item.notes,
      status: item.status,
    }));
  }
}