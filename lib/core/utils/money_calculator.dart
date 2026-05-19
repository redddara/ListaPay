import 'package:decimal/decimal.dart';

/// Decimal-safe money operations — prevents floating-point balance errors.
abstract final class MoneyCalculator {
  static Decimal parse(String value) => Decimal.parse(value);

  static String format(Decimal amount) => amount.toStringAsFixed(2);

  /// Remaining Balance = Total Utang - Total Payments
  static Decimal remainingBalance({
    required Decimal totalUtang,
    required Decimal totalPayments,
  }) {
    final balance = totalUtang - totalPayments;
    if (balance < Decimal.zero) {
      throw const FormatException('Negative balance not allowed');
    }
    return balance;
  }

  /// Validates payment does not exceed current balance.
  static void validatePayment({
    required Decimal paymentAmount,
    required Decimal currentBalance,
  }) {
    if (paymentAmount <= Decimal.zero) {
      throw const FormatException('Payment must be greater than zero');
    }
    if (paymentAmount > currentBalance) {
      throw const FormatException('Payment cannot exceed remaining balance');
    }
  }

  static Decimal sum(Iterable<Decimal> amounts) {
    return amounts.fold(Decimal.zero, (a, b) => a + b);
  }
}
