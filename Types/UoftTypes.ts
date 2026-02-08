import { SectionType, UoftCourseType, UoftTermType } from "./ModelTypes";

type BaseUoftAdapterOptionsType = {
  query?: string;
  season?: "fall-winter" | "summer";
  year?: number; // Year of the fall term for the school year
  page?: number;
  method?: "api" | "lambda";
  lambdaName?: string;
};

export type UoftAdapterAPIOptionsType = BaseUoftAdapterOptionsType & {
  method: "api";
};

export type UoftAdapterLambdaOptionsType = BaseUoftAdapterOptionsType & {
  method: "lambda";
  lambdaName: string;
};

export type UoftAdapterOptionsType = UoftAdapterAPIOptionsType | UoftAdapterLambdaOptionsType;

export type RawUoftTeachMethodType = "LEC" | "TUT" | "LAB" | "PRA";
export type RawUoftCampusType =
  | "Scarborough"
  | "University of Toronto at Mississauga"
  | "St. George";

export type RawUoftCourseType = {
  name: string;
  code: string;
  sectionCode: "F" | "S" | "Y";
  campus: RawUoftCampusType;
  sessions: string[];
  sections: RawUoftSectionType[];
};

export type RawUoftSectionType = {
  teachMethod: RawUoftTeachMethodType;
  sectionNumber: string;
  number: string;
  campus: RawUoftCampusType;
  currentEnrolment: number | null;
  maxEnrolment: number | null;
  waitlistInd: "Y" | "N" | null;
  currentWaitlist: number | null;
  tbaInd: "Y" | "N" | null;
};

export type FormattedUoftCampusType = "Scarborough" | "Mississauga" | "St. George";
export type FormattedUoftSectionType = Omit<SectionType, "course" | "lastUpdatedAt"> & {
  tba: boolean;
};
export type FormattedUoftCourseType = Pick<
  UoftCourseType,
  "name" | "code" | "school" | "campus" | "slug"
> & {
  sections: FormattedUoftSectionType[];
  term: UoftTermType;
};
