import {
  UserProfile,
  Gym,
  Visit,
  FollowUp,
  ActivityTimelineItem,
  RepsiModule,
  Feature,
  Task,
  Bug,
  Blocker,
  DailyWorkLog,
  FeatureRequest,
  Release,
  NotificationItem,
} from "@/types";

// Empty real dataset - populated dynamically via Appwrite TablesDB
export const SEED_USERS: UserProfile[] = [];
export const SEED_GYMS: Gym[] = [];
export const SEED_VISITS: Visit[] = [];
export const SEED_FOLLOWUPS: FollowUp[] = [];
export const SEED_ACTIVITIES: ActivityTimelineItem[] = [];
export const SEED_RELEASES: Release[] = [];
export const SEED_MODULES: RepsiModule[] = [];
export const SEED_FEATURES: Feature[] = [];
export const SEED_TASKS: Task[] = [];
export const SEED_BUGS: Bug[] = [];
export const SEED_BLOCKERS: Blocker[] = [];
export const SEED_DAILY_LOGS: DailyWorkLog[] = [];
export const SEED_FEATURE_REQUESTS: FeatureRequest[] = [];
export const SEED_NOTIFICATIONS: NotificationItem[] = [];
