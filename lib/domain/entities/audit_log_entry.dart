class AuditLogEntry {
  const AuditLogEntry({
    required this.id,
    required this.storeId,
    required this.userId,
    this.userEmail,
    required this.action,
    this.entityType,
    this.entityId,
    this.details,
    required this.createdAt,
  });

  final String id;
  final String storeId;
  final String userId;
  final String? userEmail;
  final String action;
  final String? entityType;
  final String? entityId;
  final String? details;
  final DateTime createdAt;
}
