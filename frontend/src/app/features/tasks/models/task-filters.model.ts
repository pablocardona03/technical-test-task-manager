import { TaskPriority } from './task-priority.type';
import { TaskStatus } from './task-status.type';

export interface TaskFilters {
  status: TaskStatus | '';
  assignedUserId: number | null;
  priority: TaskPriority | '';
  tag: string;
}
