/// Role-based access for owner vs cashier.
enum UserRole {
  owner('owner'),
  cashier('cashier');

  const UserRole(this.value);
  final String value;

  static UserRole fromString(String value) {
    return UserRole.values.firstWhere(
      (r) => r.value == value,
      orElse: () => UserRole.cashier,
    );
  }
}

/// Permissions matrix — enforced in repositories and UI.
abstract final class RolePermissions {
  static bool canDeleteRecords(UserRole role) => role == UserRole.owner;
  static bool canEditRecords(UserRole role) => role == UserRole.owner;
  static bool canViewReports(UserRole role) => role == UserRole.owner;
  static bool canManageBackups(UserRole role) => role == UserRole.owner;
  static bool canManageUsers(UserRole role) => role == UserRole.owner;
  static bool canAddUtang(UserRole role) => true;
  static bool canAddPayment(UserRole role) => true;
  static bool canViewCustomers(UserRole role) => true;
}
