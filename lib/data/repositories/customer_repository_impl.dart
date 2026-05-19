import 'package:decimal/decimal.dart';
import 'package:lista_pay/core/constants/app_constants.dart';
import 'package:lista_pay/core/database/encrypted_database.dart';
import 'package:lista_pay/core/errors/app_exception.dart';
import 'package:lista_pay/core/utils/money_calculator.dart';
import 'package:lista_pay/data/services/audit_log_service.dart';
import 'package:lista_pay/data/services/sync_queue_service.dart';
import 'package:lista_pay/domain/entities/customer.dart';
import 'package:lista_pay/domain/entities/transaction.dart';
import 'package:lista_pay/domain/repositories/customer_repository.dart';
import 'package:uuid/uuid.dart';

class CustomerRepositoryImpl implements CustomerRepository {
  CustomerRepositoryImpl(
    this._db,
    this._audit,
    this._sync, {
    required this.storeId,
  });

  final EncryptedDatabase _db;
  final AuditLogService _audit;
  final SyncQueueService _sync;
  final String storeId;
  static const _uuid = Uuid();

  @override
  Future<List<Customer>> getCustomers({
    required String storeId,
    int limit = AppConstants.defaultPageSize,
    int offset = 0,
    bool includeDeleted = false,
  }) async {
    final where = includeDeleted ? 'store_id = ?' : 'store_id = ? AND deleted_at IS NULL';
    final rows = await _db.database.query(
      'customers',
      where: where,
      whereArgs: [storeId],
      orderBy: 'name COLLATE NOCASE ASC',
      limit: limit,
      offset: offset,
    );
    return rows.map(_mapCustomer).toList();
  }

  @override
  Future<Customer?> getById(String id) async {
    final rows = await _db.database.query('customers', where: 'id = ?', whereArgs: [id], limit: 1);
    if (rows.isEmpty) return null;
    return _mapCustomer(rows.first);
  }

  @override
  Future<Customer> addUtang({
    required String customerId,
    required Decimal amount,
    required String userId,
    required String idempotencyKey,
    String? note,
  }) async {
    return _addTransaction(
      customerId: customerId,
      type: TransactionType.utang,
      amount: amount,
      userId: userId,
      idempotencyKey: idempotencyKey,
      note: note,
      auditAction: 'add_utang',
    );
  }

  @override
  Future<Customer> addPayment({
    required String customerId,
    required Decimal amount,
    required String userId,
    required String idempotencyKey,
    String? note,
  }) async {
    final customer = await getById(customerId);
    if (customer == null) {
      throw const ValidationException(message: 'Customer hindi mahanap.');
    }
    MoneyCalculator.validatePayment(
      paymentAmount: amount,
      currentBalance: customer.balance,
    );
    return _addTransaction(
      customerId: customerId,
      type: TransactionType.payment,
      amount: amount,
      userId: userId,
      idempotencyKey: idempotencyKey,
      note: note,
      auditAction: 'add_payment',
    );
  }

  Future<Customer> _addTransaction({
    required String customerId,
    required TransactionType type,
    required Decimal amount,
    required String userId,
    required String idempotencyKey,
    String? note,
    required String auditAction,
  }) async {
    // Idempotency — prevent duplicate transactions on retry/crash
    final existing = await _db.database.query(
      'transactions',
      where: 'idempotency_key = ?',
      whereArgs: [idempotencyKey],
      limit: 1,
    );
    if (existing.isNotEmpty) {
      final c = await getById(customerId);
      if (c == null) throw const ValidationException(message: 'Customer hindi mahanap.');
      return c;
    }

    Customer? updatedCustomer;
    String? txId;
    Map<String, dynamic>? syncPayload;

    await _db.runTransaction((txn) async {
      final customerRows = await txn.query('customers', where: 'id = ?', whereArgs: [customerId]);
      if (customerRows.isEmpty) {
        throw const ValidationException(message: 'Customer hindi mahanap.');
      }
      final row = customerRows.first;
      if (row['deleted_at'] != null) {
        throw const ValidationException(message: 'Customer ay nasa trash na.');
      }

      var totalUtang = Decimal.parse(row['total_utang']! as String);
      var totalPayments = Decimal.parse(row['total_payments']! as String);

      if (type == TransactionType.utang) {
        totalUtang += amount;
      } else {
        totalPayments += amount;
      }

      final balance = MoneyCalculator.remainingBalance(
        totalUtang: totalUtang,
        totalPayments: totalPayments,
      );

      final now = DateTime.now().millisecondsSinceEpoch;
      txId = _uuid.v4();

      await txn.insert('transactions', {
        'id': txId!,
        'customer_id': customerId,
        'store_id': storeId,
        'type': type.value,
        'amount': MoneyCalculator.format(amount),
        'note': note,
        'created_by': userId,
        'created_at': now,
        'updated_at': now,
        'idempotency_key': idempotencyKey,
        'sync_status': 'pending',
      });

      await txn.update(
        'customers',
        {
          'total_utang': MoneyCalculator.format(totalUtang),
          'total_payments': MoneyCalculator.format(totalPayments),
          'balance': MoneyCalculator.format(balance),
          'updated_at': now,
          'sync_status': 'pending',
          'version': (row['version'] as int) + 1,
        },
        where: 'id = ?',
        whereArgs: [customerId],
      );

      updatedCustomer = _mapCustomer({
        ...row,
        'total_utang': MoneyCalculator.format(totalUtang),
        'total_payments': MoneyCalculator.format(totalPayments),
        'balance': MoneyCalculator.format(balance),
        'updated_at': now,
        'version': (row['version'] as int) + 1,
        'sync_status': 'pending',
      });

      syncPayload = {
        'store_id': storeId,
        'customer_id': customerId,
        'id': txId,
        'type': type.value,
        'amount': MoneyCalculator.format(amount),
        'note': note,
        'created_by': userId,
        'created_at': now,
        'idempotency_key': idempotencyKey,
      };
    });

    if (txId != null && syncPayload != null) {
      await _sync.enqueueChange(
        entityType: 'transaction',
        entityId: txId,
        operation: 'create',
        payload: syncPayload,
      );
    }

    await _audit.log(
      storeId: storeId,
      userId: userId,
      action: auditAction,
      entityType: 'transaction',
      entityId: idempotencyKey,
      details: {'amount': MoneyCalculator.format(amount), 'customer_id': customerId},
    );

    return updatedCustomer!;
  }

  @override
  Future<void> softDelete(String customerId, {required String userId}) async {
    final now = DateTime.now().millisecondsSinceEpoch;
    await _db.database.update(
      'customers',
      {'deleted_at': now, 'updated_at': now, 'sync_status': 'pending'},
      where: 'id = ?',
      whereArgs: [customerId],
    );
    await _audit.log(
      storeId: storeId,
      userId: userId,
      action: 'soft_delete_customer',
      entityType: 'customer',
      entityId: customerId,
    );
  }

  @override
  Future<void> restore(String customerId, {required String userId}) async {
    final now = DateTime.now().millisecondsSinceEpoch;
    await _db.database.update(
      'customers',
      {'deleted_at': null, 'updated_at': now, 'sync_status': 'pending'},
      where: 'id = ?',
      whereArgs: [customerId],
    );
    await _audit.log(
      storeId: storeId,
      userId: userId,
      action: 'restore_customer',
      entityType: 'customer',
      entityId: customerId,
    );
  }

  @override
  Future<void> purgeExpiredTrash() async {
    final cutoff = DateTime.now().subtract(AppConstants.trashRetention).millisecondsSinceEpoch;
    await _db.database.delete(
      'customers',
      where: 'deleted_at IS NOT NULL AND deleted_at < ?',
      whereArgs: [cutoff],
    );
  }

  Customer _mapCustomer(Map<String, Object?> row) {
    return Customer(
      id: row['id']! as String,
      storeId: row['store_id']! as String,
      name: row['name']! as String,
      phone: row['phone'] as String?,
      totalUtang: Decimal.parse(row['total_utang']! as String),
      totalPayments: Decimal.parse(row['total_payments']! as String),
      balance: Decimal.parse(row['balance']! as String),
      notes: row['notes'] as String?,
      createdAt: DateTime.fromMillisecondsSinceEpoch(row['created_at']! as int),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(row['updated_at']! as int),
      deletedAt: row['deleted_at'] != null
          ? DateTime.fromMillisecondsSinceEpoch(row['deleted_at']! as int)
          : null,
      syncStatus: SyncStatus.fromString(row['sync_status']! as String),
      version: row['version']! as int,
    );
  }
}
