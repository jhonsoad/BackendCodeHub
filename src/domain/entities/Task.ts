export interface Task {
  id?: string | undefined;
  title: string;
  notes?: string | undefined;
  status: string;
}

export interface CreateTaskDTO {
  title: string;
  notes?: string | undefined;
}
