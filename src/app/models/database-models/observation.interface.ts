export interface Observation {
  id: string;
  transcriptionId: string;
  createdBy: string;
  content: string;
  createdAt: string; // ISO date string
  isDeleted: boolean;
}