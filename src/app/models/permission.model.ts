export type PermissionName =
  | 'user:manage'
  | 'observation:create:own'
  | 'observation:create:all'
  | 'observation:delete:own'
  | 'observation:delete:all'
  | 'transcription:read:own'
  | 'transcription:read:all'
  | 'transcription:write:own'
  | 'transcription:write:all'
  | 'transcription:delete:own'
  | 'transcription:delete:all';