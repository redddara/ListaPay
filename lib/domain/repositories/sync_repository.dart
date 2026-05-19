abstract class SyncRepository {
  Future<void> enqueueChange({
    required String entityType,
    required String entityId,
    required String operation,
    required Map<String, dynamic> payload,
  });

  Future<int> processQueue();

  Future<int> pendingCount();

  Stream<int> watchPendingCount();
}
