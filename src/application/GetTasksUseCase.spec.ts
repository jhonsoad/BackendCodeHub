import { describe, expect, it } from '@jest/globals';
import type { Task } from '../domain/entities/Task.js';
import type { ITasksProvider } from '../domain/interfaces/ITasksProvider.js';
import { GetTasksUseCase } from './GetTasksUseCase.js';


// 1. Criamos um Mock (Fake) da interface do domínio
class TasksProviderMock implements ITasksProvider {
  public shouldFail = false;

  async fetchTasks(accessToken: string): Promise<Task[]> {
    if (this.shouldFail) {
      throw new Error('Erro simulado na API');
    }

    return [
      { id: '1', title: 'Tarefa Teste 1', status: 'needsAction' },
      { id: '2', title: 'Tarefa Teste 2', status: 'completed' },
    ];
  }
}

describe('GetTasksUseCase', () => {
  it('deve retornar uma lista de tarefas com sucesso quando um token válido é fornecido', async () => {
    // Arrange
    const tasksProviderMock = new TasksProviderMock();
    const sut = new GetTasksUseCase(tasksProviderMock); // sut = System Under Test

    // Act
    const tasks = await sut.execute('fake-access-token');

    // Assert
    expect(tasks).toHaveLength(2);
    expect(tasks[0]?.title).toBe('Tarefa Teste 1');
    expect(tasks[1]?.id).toBe('2');
  });

  it('deve lançar um erro se o token de acesso não for fornecido', async () => {
    // Arrange
    const tasksProviderMock = new TasksProviderMock();
    const sut = new GetTasksUseCase(tasksProviderMock);

    // Act & Assert
    // Passando uma string vazia ou undefined
    await expect(sut.execute('')).rejects.toThrow('Token de acesso é obrigatório.');
  });

  it('deve propagar o erro caso o provider falhe ao buscar as tarefas', async () => {
    // Arrange
    const tasksProviderMock = new TasksProviderMock();
    tasksProviderMock.shouldFail = true; // Forçamos o mock a falhar
    const sut = new GetTasksUseCase(tasksProviderMock);

    // Act & Assert
    await expect(sut.execute('fake-access-token')).rejects.toThrow('Erro simulado na API');
  });
});