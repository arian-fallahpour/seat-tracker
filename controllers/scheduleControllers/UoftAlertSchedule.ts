import { FormattedUoftCourseType, FormattedUoftSectionType } from "@/Types/UoftTypes";
import { HydratedAlertType, HydratedCourseType, HydratedSectionType } from "@/Types/ModelTypes";
import { ScheduleType } from "@/Types/ScheduleTypes";

import Logger from "@/utils/Logger";
import UoftParallel from "@/utils/Uoft/UoftParallel";
import AlertModel from "@/models/AlertModel";
import { upsertCoursesAndSections } from "@/utils/app/schema-utils";
import alertsData from "@/data/alerts-data";

import { CronJob } from "cron";

type PopulatedAlertType = HydratedAlertType & {
  course: HydratedCourseType & {
    sections: HydratedSectionType[];
  };
};

type AlteredAlertType = PopulatedAlertType & {
  alteredSections: FormattedUoftSectionType[];
};

class UoftAlertSchedule implements ScheduleType {
  static alerts: PopulatedAlertType[];
  static alertsChanged: AlteredAlertType[];
  static alertsFreed: AlteredAlertType[];
  static updatedCourses: Record<string, FormattedUoftCourseType> = {};

  static async initialize(): Promise<void> {
    const { periodMinutes } = alertsData;

    CronJob.from({
      onTick: this.run.bind(this),
      cronTime: `0 */${periodMinutes} * * * *`,
      waitForCompletion: true,
      start: true,
      runOnInit: true,
    });
  }

  static async run(): Promise<void> {
    let i = 1;

    Logger.info(`Starting UoftAlertSchedule at ${new Date().toISOString()}`);

    await this.getActiveAlerts();
    Logger.info(`${i++}: Found ${this.alerts.length} active alerts`);

    await this.filterDeactivatedAlerts();
    Logger.info(`${i++}: After deactivation, ${this.alerts.length} alerts remain`);

    await this.fetchUpdatedCourseData();
    Logger.info(`${i++}: Fetched updated course data`);

    this.filterAlerts();

    await this.sendAlerts();
    Logger.info(`${i++}: Sent ${this.alertsFreed.length} freed alerts`);

    await this.updateDatabase();
    Logger.info(`${i++}: Updated database with changed course data`);

    Logger.info(`UoftAlertSchedule completed at ${new Date().toISOString()}`);
  }

  static async getActiveAlerts(): Promise<void> {
    const alerts = await AlertModel.find({ status: "active" }).populate({
      path: "course",
      populate: { path: "sections" },
    });

    this.alerts = alerts.filter((a) => a.course !== null) as PopulatedAlertType[];
  }

  static async filterDeactivatedAlerts(): Promise<void> {
    const deactivated = this.alerts.filter((alert) => !alert.course.isEnrollable());
    await Promise.allSettled(deactivated.map(async (alert) => await alert.deactivate()));

    this.alerts = this.alerts.filter((alert) => alert.course.isEnrollable());
  }

  static async fetchUpdatedCourseData(): Promise<void> {
    const courseCodes = new Set(this.alerts.map((a) => a.course.code));
    const updatedCourses = await UoftParallel.fetchAll(Array.from(courseCodes));

    for (const course of updatedCourses) {
      this.updatedCourses[course.code] = course;
    }
  }

  static findSection(updatedSections: FormattedUoftSectionType[], number: string, type: string) {
    return updatedSections.find((s) => s.number === number && s.type === type);
  }

  static filterAlert(
    alert: PopulatedAlertType,
    method: "hasFreedUp" | "hasChanged",
  ): AlteredAlertType | null {
    const updatedCourse = this.updatedCourses[alert.course.code];
    if (!updatedCourse) return null;

    const clone = alert.$clone() as AlteredAlertType;
    clone.alteredSections = [];

    for (const section of clone.course.sections) {
      const updatedSection = this.findSection(updatedCourse.sections, section.number, section.type);
      if (!updatedSection) continue;

      if (section[method](updatedSection)) {
        clone.alteredSections.push(updatedSection);
      }
    }

    return clone;
  }

  static filterAlerts(): void {
    this.alertsFreed = this.alerts
      .map((alert) => this.filterAlert(alert, "hasFreedUp"))
      .filter((alert) => alert && alert.alteredSections.length > 0);
    this.alertsChanged = this.alerts
      .map((alert) => this.filterAlert(alert, "hasChanged"))
      .filter((alert) => alert && alert.alteredSections.length > 0);
  }

  static async sendAlerts(): Promise<void> {
    await Promise.allSettled(
      this.alertsFreed.map(async (alert) => alert.notify(alert.alteredSections)),
    );
  }

  static async updateDatabase(): Promise<void> {
    const changedCourses = new Set<string>();

    for (const alert of this.alertsChanged) {
      if (!changedCourses.has(alert.course.code)) {
        changedCourses.add(alert.course.code);
      }
    }

    const updatedCourses = Object.values(this.updatedCourses);
    const upsertableCourses = updatedCourses.filter((course) => changedCourses.has(course.code));

    await upsertCoursesAndSections(upsertableCourses);
  }
}

export default UoftAlertSchedule;
