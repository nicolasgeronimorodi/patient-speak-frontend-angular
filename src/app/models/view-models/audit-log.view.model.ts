export interface AuditLogViewModel {
  id: string;
  userId: string | null;
  userFullName: string;
  action: string;
  tableName: string;
  tableDisplayName: string;
  recordId: string;
  oldData: Record<string, any> | null;
  newData: Record<string, any> | null;
  createdAt: Date;
  description: string;
}
