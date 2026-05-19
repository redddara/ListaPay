import 'package:decimal/decimal.dart';
import 'package:lista_pay/domain/entities/customer.dart';

enum TransactionType {
  utang('utang'),
  payment('payment');

  const TransactionType(this.value);
  final String value;

  static TransactionType fromString(String v) =>
      TransactionType.values.firstWhere((t) => t.value == v);
}

class UtangTransaction {
  const UtangTransaction({
    required this.id,
    required this.customerId,
    required this.storeId,
    required this.type,
    required this.amount,
    this.note,
    required this.createdBy,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    required this.idempotencyKey,
    this.syncStatus = SyncStatus.pending,
  });

  final String id;
  final String customerId;
  final String storeId;
  final TransactionType type;
  final Decimal amount;
  final String? note;
  final String createdBy;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;
  final String idempotencyKey;
  final SyncStatus syncStatus;

  bool get isDeleted => deletedAt != null;
}
