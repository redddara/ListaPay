import 'package:lista_pay/core/constants/app_constants.dart';
import 'package:workmanager/workmanager.dart';

const _syncTaskName = 'lista_pay_background_sync';

@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    // In production: initialize Firebase + encrypted DB in isolate-safe way,
    // then process sync queue. Stub returns success for wiring.
    return Future.value(true);
  });
}

/// Registers periodic background sync (requirement 13).
abstract final class BackgroundSyncService {
  static Future<void> registerPeriodicSync() async {
    await Workmanager().registerPeriodicTask(
      _syncTaskName,
      _syncTaskName,
      frequency: AppConstants.backgroundSyncInterval,
      constraints: Constraints(networkType: NetworkType.connected),
    );
  }
}
