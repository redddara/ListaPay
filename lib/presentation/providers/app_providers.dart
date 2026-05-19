import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lista_pay/core/database/encrypted_database.dart';
import 'package:lista_pay/core/security/biometric_service.dart';
import 'package:lista_pay/core/security/pin_service.dart';
import 'package:lista_pay/core/security/secure_storage_service.dart';
import 'package:lista_pay/core/security/session_manager.dart';
import 'package:lista_pay/data/repositories/auth_repository_impl.dart';
import 'package:lista_pay/data/repositories/customer_repository_impl.dart';
import 'package:lista_pay/data/services/audit_log_service.dart';
import 'package:lista_pay/data/services/sync_queue_service.dart';
import 'package:lista_pay/domain/repositories/auth_repository.dart';
import 'package:lista_pay/domain/repositories/customer_repository.dart';
import 'package:lista_pay/domain/repositories/sync_repository.dart';

final secureStorageProvider = Provider<SecureStorageService>((ref) => SecureStorageService());

final encryptedDatabaseProvider = Provider<EncryptedDatabase>((ref) {
  final db = EncryptedDatabase(ref.watch(secureStorageProvider));
  ref.onDispose(() => db.close());
  return db;
});

final sessionManagerProvider = Provider<SessionManager>(
  (ref) => SessionManager(ref.watch(secureStorageProvider)),
);

final pinServiceProvider = Provider<PinService>(
  (ref) => PinService(ref.watch(secureStorageProvider)),
);

final biometricServiceProvider = Provider<BiometricService>((ref) => BiometricService());

final firebaseAuthProvider = Provider<FirebaseAuth>((ref) => FirebaseAuth.instance);
final firestoreProvider = Provider<FirebaseFirestore>((ref) => FirebaseFirestore.instance);

final auditLogServiceProvider = Provider<AuditLogService>(
  (ref) => AuditLogService(ref.watch(encryptedDatabaseProvider)),
);

final syncRepositoryProvider = Provider<SyncRepository>(
  (ref) => SyncQueueService(ref.watch(encryptedDatabaseProvider)),
);

/// Set after login from Firestore user profile.
final storeIdProvider = StateProvider<String?>((ref) => null);

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(
    ref.watch(firebaseAuthProvider),
    ref.watch(firestoreProvider),
    ref.watch(pinServiceProvider),
    ref.watch(biometricServiceProvider),
    ref.watch(sessionManagerProvider),
  );
});

final customerRepositoryProvider = Provider<CustomerRepository?>((ref) {
  final storeId = ref.watch(storeIdProvider);
  if (storeId == null) return null;
  return CustomerRepositoryImpl(
    ref.watch(encryptedDatabaseProvider),
    ref.watch(auditLogServiceProvider),
    ref.watch(syncRepositoryProvider) as SyncQueueService,
    storeId: storeId,
  );
});

final databaseInitProvider = FutureProvider<void>((ref) async {
  await ref.watch(encryptedDatabaseProvider).init();
});

final pendingSyncCountProvider = StreamProvider<int>((ref) {
  final sync = ref.watch(syncRepositoryProvider) as SyncQueueService;
  return sync.watchPendingCount();
});
