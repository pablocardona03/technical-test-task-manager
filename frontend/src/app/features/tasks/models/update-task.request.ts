export interface UpdateTaskRequest {
  title: string;
  description: string | null;
  assignedUserId: number;
  createdByUserId: number;
  additionalDataJson: string;
}
