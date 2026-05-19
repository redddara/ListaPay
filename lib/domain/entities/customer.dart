import 'package:decimal/decimal.dart';

/// Customer with computed balance fields (stored denormalized for fast queries).
class Customer {
  const Customer({
    required this.id,
    required this.storeId,
    required this.name,
    this.phone,
    required this.totalUtang,
    required this.totalPayments,
    required this.balance,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    this.syncStatus = SyncStatus.pending,
    this.version = 1,
  });

  final String id;
  final String storeId;
  final String name;
  final String? phone;
  final Decimal totalUtang;
  final Decimal totalPayments;
  final Decimal balance;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;
  final SyncStatus syncStatus;
  final int version;

  bool get isDeleted => deletedAt != null;
}

enum SyncStatus {
  synced('synced'),
  pending('pending'),
  failed('failed');

  const SyncStatus(this.value);
  final String value;

  static SyncStatus fromString(String v) =>
      SyncStatus.values.firstWhere((s) => s.value == v, orElse: () => SyncStatus.pending);
}
