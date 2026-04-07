import { SortDirection } from './sort-direction.type';
import { TaskPriority } from './task-priority.type';
import { TaskSortField } from './task-sort-field.type';
import { TaskStatus } from './task-status.type';

export interface TaskFilters {
  status: TaskStatus | '';
  assignedUserId: number | null;
  priority: TaskPriority | '';
  tag: string;
  hideCompleted: boolean;
  sortBy: TaskSortField;
  sortDirection: SortDirection;
}
