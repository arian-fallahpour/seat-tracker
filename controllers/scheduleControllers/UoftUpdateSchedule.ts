import { ScheduleType } from "@/Types/ScheduleTypes";

class UoftUpdateSchedule implements ScheduleType {
  static async initialize(): Promise<void> {}

  static async run(): Promise<void> {}
}

export default UoftUpdateSchedule;
