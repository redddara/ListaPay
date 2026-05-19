/// SQL schema for encrypted local SQLite — indexed for scale.
abstract final class DatabaseSchema {
  static const String createCustomers = '''
    CREATE TABLE customers (
      id TEXT PRIMARY KEY NOT NULL,
      store_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      total_utang TEXT NOT NULL DEFAULT '0.00',
      total_payments TEXT NOT NULL DEFAULT '0.00',
      balance TEXT NOT NULL DEFAULT '0.00',
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      deleted_at INTEGER,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      version INTEGER NOT NULL DEFAULT 1
    );
    CREATE INDEX idx_customers_store ON customers(store_id);
    CREATE INDEX idx_customers_name ON customers(name COLLATE NOCASE);
    CREATE INDEX idx_customers_deleted ON customers(deleted_at);
  ''';

  static const String createTransactions = '''
    CREATE TABLE transactions (
      id TEXT PRIMARY KEY NOT NULL,
      customer_id TEXT NOT NULL,
      store_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('utang', 'payment')),
      amount TEXT NOT NULL,
      note TEXT,
      created_by TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      deleted_at INTEGER,
      idempotency_key TEXT NOT NULL UNIQUE,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
    CREATE INDEX idx_tx_customer ON transactions(customer_id);
    CREATE INDEX idx_tx_created ON transactions(created_at DESC);
    CREATE INDEX idx_tx_sync ON transactions(sync_status);
  ''';

  static const String createSyncQueue = '''
    CREATE TABLE sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      operation TEXT NOT NULL CHECK(operation IN ('create', 'update', 'delete')),
      payload TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      retry_count INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'synced', 'failed'))
    );
    CREATE INDEX idx_sync_status ON sync_queue(status);
  ''';

  static const String createAuditLogs = '''
    CREATE TABLE audit_logs (
      id TEXT PRIMARY KEY NOT NULL,
      store_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_email TEXT,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      details TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX idx_audit_store ON audit_logs(store_id, created_at DESC);
  ''';

  static const String createBackupsMeta = '''
    CREATE TABLE backup_meta (
      id TEXT PRIMARY KEY NOT NULL,
      created_at INTEGER NOT NULL,
      size_bytes INTEGER,
      source TEXT NOT NULL CHECK(source IN ('auto', 'manual')),
      cloud_path TEXT,
      local_path TEXT,
      restored_at INTEGER
    );
  ''';

  static List<String> get all => [
        createCustomers,
        createTransactions,
        createSyncQueue,
        createAuditLogs,
        createBackupsMeta,
      ];
}
