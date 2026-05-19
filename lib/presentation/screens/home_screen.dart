import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lista_pay/core/rbac/user_role.dart';
import 'package:lista_pay/presentation/providers/app_providers.dart';
import 'package:lista_pay/presentation/widgets/sync_status_chip.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final syncAsync = ref.watch(pendingSyncCountProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('ListaPay'),
        actions: [
          syncAsync.when(
            data: (count) => Padding(
              padding: const EdgeInsets.only(right: 12),
              child: Center(child: SyncStatusChip(pendingCount: count)),
            ),
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _MenuCard(
            icon: Icons.people_outline,
            title: 'Mga Customer',
            subtitle: 'Tingnan at magdagdag ng utang',
            onTap: () {},
          ),
          _MenuCard(
            icon: Icons.delete_outline,
            title: 'Trash Bin',
            subtitle: 'I-restore ang na-delete',
            onTap: () {},
          ),
          FutureBuilder<UserRole?>(
            future: ref.read(authRepositoryProvider).currentUserRole,
            builder: (context, snapshot) {
              if (snapshot.data != UserRole.owner) return const SizedBox.shrink();
              return _MenuCard(
                icon: Icons.backup_outlined,
                title: 'Backup & Restore',
                subtitle: 'Manual backup at recovery',
                onTap: () {},
              );
            },
          ),
          _MenuCard(
            icon: Icons.settings_outlined,
            title: 'Settings',
            subtitle: 'PIN, biometric, app lock',
            onTap: () {},
          ),
        ],
      ),
    );
  }
}

class _MenuCard extends StatelessWidget {
  const _MenuCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Icon(icon, size: 40, color: Theme.of(context).colorScheme.primary),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 4),
                    Text(subtitle, style: Theme.of(context).textTheme.bodyMedium),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, size: 32),
            ],
          ),
        ),
      ),
    );
  }
}
