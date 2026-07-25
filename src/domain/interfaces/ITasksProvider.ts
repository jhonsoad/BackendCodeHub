import type { Task } from "../entities/Task.js";

export interface ITasksProvider {
  fetchTasks(accessToken: string): Promise<Task[]>;
}