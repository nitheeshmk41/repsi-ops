export type UserRole =
  | "ADMIN"
  | "FOUNDER"
  | "SALES"
  | "PROJECT_MANAGER"
  | "DEVELOPER"
  | "QA"
  | "MARKETING"
  | "CUSTOMER_SUCCESS";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  department: string;
  active_tasks_count?: number;
  completed_tasks_count?: number;
  open_bugs_count?: number;
  overdue_tasks_count?: number;
  created_at: string;
}

export type BusinessType =
  | "Gym"
  | "Fitness Studio"
  | "CrossFit"
  | "Yoga"
  | "Personal Training"
  | "Martial Arts"
  | "Sports Academy"
  | "Wellness Center"
  | "Multi-branch";

export type PipelineStage =
  | "PROSPECT"
  | "CONTACTED"
  | "VISIT_PLANNED"
  | "VISITED"
  | "DEMO_SCHEDULED"
  | "DEMO_COMPLETED"
  | "TRIAL"
  | "NEGOTIATION"
  | "WON"
  | "NOT_INTERESTED"
  | "LOST";

export type LostReason =
  | "Price too high"
  | "Already using software"
  | "Doesn't need software"
  | "Wants different features"
  | "Not ready now"
  | "Business too small"
  | "Owner unavailable"
  | "Competitor"
  | "No response"
  | "Other";

export interface Gym {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  instagram?: string;
  address: string;
  area: string;
  city: string;
  google_maps_url?: string;
  business_type: BusinessType;
  members_count?: number;
  trainers_count?: number;
  branches_count?: number;
  current_software?: string;
  current_payment_system?: string;
  business_size?: "Small" | "Medium" | "Large" | "Enterprise";
  stage: PipelineStage;
  lost_reason?: LostReason;
  lost_notes?: string;
  expected_revenue?: number;
  assigned_salesperson_id?: string;
  assigned_salesperson_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  gym_id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  is_primary: boolean;
  notes?: string;
  created_at: string;
}

export type VisitStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";

export interface Visit {
  id: string;
  gym_id: string;
  gym_name: string;
  gym_area: string;
  owner_name: string;
  salesperson_id: string;
  salesperson_name: string;
  scheduled_at: string;
  time_slot: string;
  status: VisitStatus;
  
  // Report fields
  met_owner?: boolean;
  person_met?: string;
  role_of_person_met?: string;
  interested?: boolean;
  demo_required?: boolean;
  current_software?: string;
  main_pain_point?: string;
  budget?: number;
  expected_decision_date?: string;
  response_notes?: string;
  voice_note_url?: string;
  attachments?: string[];
  next_followup_date?: string;
  next_action?: string;
  outcome?: string;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  gym_id: string;
  gym_name: string;
  contact_name?: string;
  due_date: string;
  assigned_to_id: string;
  assigned_to_name: string;
  type: "CALL" | "WHATSAPP" | "VISIT" | "EMAIL" | "DEMO";
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  notes?: string;
  created_at: string;
}

export interface ActivityTimelineItem {
  id: string;
  gym_id: string;
  user_id: string;
  user_name: string;
  type:
    | "VISIT"
    | "CALL"
    | "WHATSAPP"
    | "DEMO"
    | "NOTE"
    | "STATUS_CHANGE"
    | "FEEDBACK"
    | "FEATURE_REQUEST"
    | "CONVERSION";
  title: string;
  description: string;
  created_at: string;
}

export type ModuleStatus =
  | "PLANNED"
  | "DESIGN"
  | "DEVELOPMENT"
  | "CODE_REVIEW"
  | "QA"
  | "COMPLETED"
  | "BLOCKED"
  | "ON_HOLD";

export interface RepsiModule {
  id: string;
  name: string;
  code: string;
  description: string;
  status: ModuleStatus;
  owner_id: string;
  owner_name: string;
  priority: "P0" | "P1" | "P2" | "P3";
  progress_percent: number;
  start_date?: string;
  deadline?: string;
  documentation_url?: string;
  release_id?: string;
  release_name?: string;
  features_count?: number;
  tasks_count?: number;
  bugs_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Feature {
  id: string;
  module_id: string;
  module_name?: string;
  name: string;
  description: string;
  status: "BACKLOG" | "IN_PROGRESS" | "QA" | "DONE";
  priority: "P0" | "P1" | "P2" | "P3";
  requested_by_count?: number;
  feature_request_id?: string;
  tasks_count?: number;
  created_at: string;
}

export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "BLOCKED"
  | "DONE"
  | "CANCELLED";

export type Priority = "P0" | "P1" | "P2" | "P3";

export interface Task {
  id: string;
  title: string;
  description: string;
  module_id: string;
  module_name: string;
  feature_id?: string;
  feature_name?: string;
  assignee_id: string;
  assignee_name: string;
  reporter_id: string;
  reporter_name: string;
  priority: Priority;
  status: TaskStatus;
  start_date?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  dependencies?: string[];
  blocker_reason?: string;
  comments_count?: number;
  created_at: string;
  updated_at: string;
}

export type BugSeverity = "CRITICAL" | "MAJOR" | "MINOR" | "COSMETIC";

export type BugStatus =
  | "REPORTED"
  | "CONFIRMED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "FIXED"
  | "QA_TESTING"
  | "CLOSED"
  | "REOPENED";

export interface Bug {
  id: string;
  bug_id: string; // e.g. BUG-1042
  title: string;
  description: string;
  module_id: string;
  module_name: string;
  feature_id?: string;
  feature_name?: string;
  reporter_id: string;
  reporter_name: string;
  assigned_to_id?: string;
  assigned_to_name?: string;
  qa_owner_id?: string;
  qa_owner_name?: string;
  severity: BugSeverity;
  priority: Priority;
  environment: "Production" | "Staging" | "Development" | "Mobile_App";
  app_version: string;
  expected_result: string;
  actual_result: string;
  steps_to_reproduce: string;
  status: BugStatus;
  attachments?: string[];
  due_date?: string;
  fixed_date?: string;
  comments_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Blocker {
  id: string;
  task_id: string;
  task_title: string;
  person_id: string;
  person_name: string;
  blocker_reason: string;
  blocked_since: string;
  dependency_desc?: string;
  owner_responsible_id: string;
  owner_responsible_name: string;
  expected_resolution_date?: string;
  status: "ACTIVE" | "RESOLVED";
  created_at: string;
}

export interface DailyWorkLog {
  id: string;
  user_id: string;
  user_name: string;
  date: string;
  completed_today: string;
  in_progress: string;
  blocked: string;
  tomorrow_plan: string;
  created_at: string;
}

export interface FeatureRequest {
  id: string;
  request_code: string; // e.g. FR-102
  gym_id?: string;
  gym_name?: string;
  requested_by: string;
  title: string;
  description: string;
  business_problem: string;
  priority: Priority;
  customers_count: number;
  status: "PROPOSED" | "ACCEPTED" | "IN_PLANNING" | "IN_DEVELOPMENT" | "RELEASED" | "REJECTED";
  product_decision?: string;
  module_id?: string;
  module_name?: string;
  target_release_id?: string;
  target_release_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Release {
  id: string;
  version: string; // e.g. v1.5.0
  name: string;
  release_date: string;
  status: "PLANNED" | "IN_PROGRESS" | "QA_VERIFICATION" | "RELEASED";
  description: string;
  modules_count?: number;
  features_count?: number;
  tasks_count?: number;
  bugs_count?: number;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "SALES" | "DEV" | "QA" | "FOUNDER" | "TASK";
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  changed_by_name: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}
