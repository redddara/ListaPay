import 'package:decimal/decimal.dart';
import 'package:lista_pay/domain/entities/customer.dart';

abstract class CustomerRepository {
  Future<List<Customer>> getCustomers({
    required String storeId,
    int limit = 50,
    int offset = 0,
    bool includeDeleted = false,
  });

  Future<Customer?> getById(String id);

  Future<Customer> addUtang({
    required String customerId,
    required Decimal amount,
    required String userId,
    required String idempotencyKey,
    String? note,
  });

  Future<Customer> addPayment({
    required String customerId,
    required Decimal amount,
    required String userId,
    required String idempotencyKey,
    String? note,
  });

  /// Soft delete — moves to trash, recalculates if needed.
  Future<void> softDelete(String customerId, {required String userId});

  Future<void> restore(String customerId, {required String userId});

  Future<void> purgeExpiredTrash();
}
