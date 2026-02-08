export abstract class ScheduleType {
  static initialize: () => Promise<void>;
  static run: () => Promise<void>;
}
