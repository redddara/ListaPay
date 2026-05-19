import 'package:flutter/material.dart';

/// Synced / Pending / Failed indicator.
class SyncStatusChip extends StatelessWidget {
  const SyncStatusChip({super.key, required this.pendingCount, this.failedCount = 0});

  final int pendingCount;
  final int failedCount;

  @override
  Widget build(BuildContext context) {
    if (failedCount > 0) {
      return _chip(context, 'Failed: $failedCount', Colors.red.shade700);
    }
    if (pendingCount > 0) {
      return _chip(context, 'Pending: $pendingCount', Colors.orange.shade800);
    }
    return _chip(context, 'Synced', Colors.green.shade700);
  }

  Widget _chip(BuildContext context, String label, Color color) {
    return Chip(
      label: Text(label, style: const TextStyle(fontSize: 16, color: Colors.white)),
      backgroundColor: color,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    );
  }
}
