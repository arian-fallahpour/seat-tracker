import { Types, HydratedDocument, Model, Query } from "mongoose";
import { FormattedUoftSectionType } from "./UoftTypes";

// LOGGER
export const loggerTypeValues = [
  "info", // Logs to console
  "log", // Logs to console and database
  "warn", // Warns to console and database
  "error", // Errors to console and database
  "alert", // Logs to database and email
] as const;
export type LoggerType = (typeof loggerTypeValues)[number];
export type LogType = {
  type: LoggerType;
  message: string;
  data?: any;
  createdAt: Date;
};
export type LogMethodsType = {};
export interface LogModelType extends Model<LogType, {}, LogMethodsType> {}
export type HydratedLogType = HydratedDocument<LogType, LogMethodsType>;

// ORDER
// TODO: change
export type OrderType = {
  alert: Types.ObjectId;
  isFulfilled: boolean;
  createdAt: Date;
  stripeSessionId?: string;
  stripePaymentId?: string;
  stripePromotionIds?: string[];

  fulfill: (stripePaymentId: string, stripePromotionIds: string) => Promise<void>;
};

// EMAIL
export type EmailType = {};

// SCHEDULE
export type ScheduleOptionsType = {
  onTick?: () => Promise<void>;
  periodMinutes: number;
  activeRange?: [number, number];
};
export const defaultScheduleOptions: ScheduleOptionsType = {
  periodMinutes: 15,
};
export type ScheduleType = {
  name: string;
  enabled: boolean;
  lastCalledAt: Date;
};
export type ScheduleMethodsType = {
  justCalled: () => Promise<void>;
};
export interface ScheduleModelType extends Model<ScheduleType, {}, ScheduleMethodsType> {
  intializeRecurring: (name: string, options: ScheduleOptionsType) => Promise<void>;
}
export type HydratedScheduleType = HydratedDocument<ScheduleType, ScheduleMethodsType>;

// ALERT
export const defaultAlertStatus = "active";
export const alertStatusType = ["active", "paused", "inactive"] as const;
export const alertCodeValidMin = 10;
export type AlertStatusType = (typeof alertStatusType)[number];
export type AlertType = {
  email: string;
  course: Types.ObjectId;
  sections: Types.ObjectId[];
  status: AlertStatusType;
  createdAt: Date;
  lastAlertedAt?: Date;
  verificationCode?: string;
  verificationExpiresAt?: Date;
};
export type AlertMethodsType = {
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  notify(alteredSections: FormattedUoftSectionType[]): Promise<void>;
  expireVerification(): Promise<void>;
  createVerification(): Promise<void>;
};
export interface AlertModelType extends Model<AlertType, {}, AlertMethodsType> {
  encryptCode(code: string): string;
}
export type HydratedAlertType = HydratedDocument<AlertType, AlertMethodsType>;

// COURSE
export const courseSchoolValues = ["uoft"] as const;
export type CourseSchoolType = (typeof courseSchoolValues)[number];
export type CourseType = {
  name: string;
  code: string;
  school: CourseSchoolType;
  campus: string;
  sections: Types.ObjectId[];
  term: string;
  slug: string;
  lastUpdatedAt: Date;
};
export type CourseMethodsType = {
  isEnrollable(): boolean;
};
export interface CourseModelType extends Model<CourseType, {}, CourseMethodsType> {
  getEnrollableTerms(school: CourseSchoolType): UoftTermType[];
  search(school: CourseSchoolType, query: string): Query<HydratedCourseType[], HydratedCourseType>;
}
export type HydratedCourseType = HydratedDocument<CourseType, CourseMethodsType>;

export const uoftCampusValues = ["Scarborough", "Mississauga", "St. George", "other"] as const;
export const uoftTermValues = [
  "fall",
  "winter",
  "fall-winter",
  "summer-first",
  "summer-second",
  "summer-full",
] as const;
export type UoftCampusType = (typeof uoftCampusValues)[number];
export type UoftTermType = (typeof uoftTermValues)[number];
export type UoftCourseType = CourseType & {
  school: "uoft";
  term: UoftTermType;
  campus: UoftCampusType;
};

// SECTION
export const sectionTypeValues = ["lecture", "tutorial", "lab", "practical", "other"] as const;
export type SectionTypeType = (typeof sectionTypeValues)[number];
type SectionWithWaitlistType = {
  hasWaitlist: true;
  waitlistCount: number;
};
type SectionWithoutWaitlistType = {
  hasWaitlist: false;
  waitlistCount: null;
};
type SectionNonTBAType = {
  tba: false;
  seatsTaken: number;
  seatsTotal: number;
} & (SectionWithWaitlistType | SectionWithoutWaitlistType);
type SectionTBAType = {
  tba: true;
  seatsTaken: null;
  seatsTotal: null;
  hasWaitlist: null;
  waitlistCount: null;
};
type SectionBaseType = {
  course: Types.ObjectId;
  school: CourseSchoolType;
  type: SectionTypeType;
  number: string;
  tba: boolean;
  lastUpdatedAt: Date;
};
export type SectionType = SectionBaseType & (SectionNonTBAType | SectionTBAType);
export type SectionMethodsType = {
  hasChanged(updated: FormattedUoftSectionType): boolean;
  hasFreedUp(updated: FormattedUoftSectionType): boolean;
};
export type HydratedSectionType = HydratedDocument<SectionType, SectionMethodsType>;

export interface SectionModelType extends Model<SectionType, {}, SectionMethodsType> {}
export type UoftSectionType = SectionType & { school: "uoft" };
