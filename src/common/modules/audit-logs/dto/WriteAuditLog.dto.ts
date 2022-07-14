export interface WriteAuditLog {
  module: string;
  action: string;
  request: Record<string, any>;
}
