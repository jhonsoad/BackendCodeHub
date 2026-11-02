import { describe, expect, it } from '@jest/globals';
import type { CreateTaskDTO, Task } from '../../../domain/entities/Task.js';
import type { ITasksProvider } from '../../../domain/interfaces/ITasksProvider.js';
import { CreateTaskUseCase } from './CreateTasksUseCase.js';

class TasksProviderMock implements ITasksProvider {
  public shouldFail = false;
  public lastCalledWith?: { accessToken: string; taskData: CreateTaskDTO };

  async fetchTasks(accessToken: string): Promise<Task[]> {
    throw new Error('Method not implemented.');
  }

  async createTask(accessToken: string, taskData: CreateTaskDTO): Promise<Task> {
    if (this.shouldFail) {
      throw new Error('Erro simulado na API');
    }

    this.lastCalledWith = { accessToken, taskData };

    return {
      id: 'task-123',
      title: taskData.title,
      notes: taskData.notes,
      status: 'needsAction',
    };
  }
}

describe('CreateTaskUseCase', () => {
  it('deve criar uma tarefa com sucesso quando os dados forem válidos', async () => {
    // Arrange
    const tasksProviderMock = new TasksProviderMock();
    const sut = new CreateTaskUseCase(tasksProviderMock);
    const taskData: CreateTaskDTO = {
      title: 'Estudar TypeScript',
      notes: 'Revisar tipos e interfaces',
    };

    // Act
    const createdTask = await sut.execute('fake-token', taskData);

    // Assert
    expect(createdTask).toBeDefined();
    expect(createdTask.id).toBe('task-123');
    expect(createdTask.title).toBe(taskData.title);
    expect(createdTask.notes).toBe(taskData.notes);
    expect(createdTask.status).toBe('needsAction');

    expect(tasksProviderMock.lastCalledWith).toEqual({
      accessToken: 'fake-token',
      taskData,
    });
  });

  it('deve criar uma tarefa com sucesso mesmo se as anotações (notes) não forem fornecidas', async () => {
    // Arrange
    const tasksProviderMock = new TasksProviderMock();
    const sut = new CreateTaskUseCase(tasksProviderMock);
    const taskData: CreateTaskDTO = {
      title: 'Tarefa sem notas',
    };

    // Act
    const createdTask = await sut.execute('fake-token', taskData);

    // Assert
    expect(createdTask).toBeDefined();
    expect(createdTask.title).toBe('Tarefa sem notas');
    expect(createdTask.notes).toBeUndefined();
  });

  it('deve lançar um erro se o token de acesso for vazio', async () => {
    // Arrange
    const tasksProviderMock = new TasksProviderMock();
    const sut = new CreateTaskUseCase(tasksProviderMock);

    // Act & Assert
    await expect(
      sut.execute('', { title: 'Tarefa de Teste' }),
    ).rejects.toThrow('Token de acesso é obrigatório.');
  });

  it('deve lançar um erro se o token de acesso for indefinido ou nulo', async () => {
    // Arrange
    const tasksProviderMock = new TasksProviderMock();
    const sut = new CreateTaskUseCase(tasksProviderMock);

    // Act & Assert
    await expect(
      sut.execute(undefined as unknown as string, { title: 'Tarefa de Teste' }),
    ).rejects.toThrow('Token de acesso é obrigatório.');
  });

  it('deve lançar um erro se o título da tarefa for vazio', async () => {
    // Arrange
    const tasksProviderMock = new TasksProviderMock();
    const sut = new CreateTaskUseCase(tasksProviderMock);

    // Act & Assert
    await expect(
      sut.execute('fake-token', { title: '' }),
    ).rejects.toThrow('O título da tarefa é obrigatório.');
  });

  it('deve lançar um erro se o título for apenas espaços em branco', async () => {
    // Arrange
    const tasksProviderMock = new TasksProviderMock();
    const sut = new CreateTaskUseCase(tasksProviderMock);

    // Act & Assert
    await expect(
      sut.execute('fake-token', { title: '     ' }),
    ).rejects.toThrow('O título da tarefa é obrigatório.');
  });

  it('deve lançar um erro se o título for indefinido', async () => {
    // Arrange
    const tasksProviderMock = new TasksProviderMock();
    const sut = new CreateTaskUseCase(tasksProviderMock);

    // Act & Assert
    await expect(
      sut.execute('fake-token', { title: undefined as unknown as string }),
    ).rejects.toThrow('O título da tarefa é obrigatório.');
  });

  it('deve propagar o erro caso o provider falhe ao criar a tarefa', async () => {
    // Arrange
    const tasksProviderMock = new TasksProviderMock();
    tasksProviderMock.shouldFail = true;
    const sut = new CreateTaskUseCase(tasksProviderMock);

    // Act & Assert
    await expect(
      sut.execute('fake-token', { title: 'Tarefa válida' }),
    ).rejects.toThrow('Erro simulado na API');
  });
});
