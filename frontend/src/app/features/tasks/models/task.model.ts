import { TaskAdditionalItem } from './task-additional-item.model';
import { TaskPriority } from './task-priority.type';
import { TaskStatus } from './task-status.type';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignedUserId: number;
  assignedUserName: string;
  createdByUserId: number;
  createdByUserName: string;
  additionalDataJson: string;
  priority: TaskPriority | null;
  estimatedEndDate: string | null;
  tags: string[];
  additionalItems: TaskAdditionalItem[];
  createdAt: string;
  updatedAt: string;
}
