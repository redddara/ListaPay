abstract class BackupRepository {
  Future<String> createManualBackup();
  Future<void> createAutoBackup();
  Future<List<BackupInfo>> listBackups();
  Future<void> restoreFromBackup(String backupId);
  Future<String> exportToFile();
  Future<void> importFromFile(String filePath);
}

class BackupInfo {
  const BackupInfo({
    required this.id,
    required this.createdAt,
    this.sizeBytes,
    required this.source,
    this.cloudPath,
    this.localPath,
  });

  final String id;
  final DateTime createdAt;
  final int? sizeBytes;
  final String source;
  final String? cloudPath;
  final String? localPath;
}
