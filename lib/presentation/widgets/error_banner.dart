import 'package:flutter/material.dart';
import 'package:lista_pay/core/errors/app_exception.dart';

/// Clear error UI with retry — for network, sync, and DB failures.
class ErrorBanner extends StatelessWidget {
  const ErrorBanner({
    super.key,
    required this.error,
    this.onRetry,
  });

  final AppException error;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return MaterialBanner(
      backgroundColor: Theme.of(context).colorScheme.errorContainer,
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(error.message, style: Theme.of(context).textTheme.bodyLarge),
          if (error.recoveryHint != null) ...[
            const SizedBox(height: 8),
            Text(error.recoveryHint!, style: Theme.of(context).textTheme.bodyMedium),
          ],
        ],
      ),
      actions: [
        if (onRetry != null)
          TextButton(onPressed: onRetry, child: const Text('Subukan ulit')),
        TextButton(
          onPressed: () => ScaffoldMessenger.of(context).hideCurrentMaterialBanner(),
          child: const Text('Isara'),
        ),
      ],
    );
  }
}
