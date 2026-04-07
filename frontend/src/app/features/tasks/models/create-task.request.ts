export interface CreateTaskRequest {
  title: string;
  description: string | null;
  assignedUserId: number;
  createdByUserId: number;
  additionalDataJson: string;
}
