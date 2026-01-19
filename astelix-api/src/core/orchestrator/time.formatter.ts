export class TimeFormatter {
  static dualTime(senderTime: Date, receiverTime: Date) {
    return {
      utc: senderTime.toISOString(),
      senderLocal: senderTime.toString(),
      receiverLocal: receiverTime.toString(),
    };
  }
}
