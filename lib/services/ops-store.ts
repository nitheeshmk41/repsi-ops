import {
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
  UserProfile,
  PipelineStage,
  LostReason,
} from "@/types";
import {
  SEED_USERS,
  SEED_GYMS,
  SEED_VISITS,
  SEED_FOLLOWUPS,
  SEED_ACTIVITIES,
  SEED_MODULES,
  SEED_FEATURES,
  SEED_TASKS,
  SEED_BUGS,
  SEED_BLOCKERS,
  SEED_DAILY_LOGS,
  SEED_FEATURE_REQUESTS,
  SEED_RELEASES,
  SEED_NOTIFICATIONS,
} from "@/lib/db/seed-data";

// In-memory persistent operational store during app runtime
class OperationalDataStore {
  private users: UserProfile[] = [...SEED_USERS];
  private gyms: Gym[] = [...SEED_GYMS];
  private visits: Visit[] = [...SEED_VISITS];
  private followUps: FollowUp[] = [...SEED_FOLLOWUPS];
  private activities: ActivityTimelineItem[] = [...SEED_ACTIVITIES];
  private modules: RepsiModule[] = [...SEED_MODULES];
  private features: Feature[] = [...SEED_FEATURES];
  private tasks: Task[] = [...SEED_TASKS];
  private bugs: Bug[] = [...SEED_BUGS];
  private blockers: Blocker[] = [...SEED_BLOCKERS];
  private dailyLogs: DailyWorkLog[] = [...SEED_DAILY_LOGS];
  private featureRequests: FeatureRequest[] = [...SEED_FEATURE_REQUESTS];
  private releases: Release[] = [...SEED_RELEASES];
  private notifications: NotificationItem[] = [...SEED_NOTIFICATIONS];

  // ----------------------------------------------------
  // Users
  // ----------------------------------------------------
  getUsers(): UserProfile[] {
    return this.users;
  }

  getUserById(id: string): UserProfile | undefined {
    return this.users.find((u) => u.id === id);
  }

  createUser(data: Omit<UserProfile, "id" | "created_at">): UserProfile {
    const newUser: UserProfile = {
      ...data,
      id: `usr_${Date.now()}`,
      active_tasks_count: 0,
      completed_tasks_count: 0,
      open_bugs_count: 0,
      overdue_tasks_count: 0,
      created_at: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // ----------------------------------------------------
  // Gyms & CRM
  // ----------------------------------------------------
  getGyms(): Gym[] {
    return this.gyms;
  }

  getGymById(id: string): Gym | undefined {
    return this.gyms.find((g) => g.id === id);
  }

  createGym(data: Omit<Gym, "id" | "created_at" | "updated_at">): Gym {
    const newGym: Gym = {
      ...data,
      id: `gym_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.gyms.unshift(newGym);
    this.logActivity({
      gym_id: newGym.id,
      user_id: newGym.assigned_salesperson_id || "usr_admin_1",
      user_name: newGym.assigned_salesperson_name || "Admin",
      type: "STATUS_CHANGE",
      title: "Gym Created in CRM",
      description: `New lead created: ${newGym.name} (${newGym.city}) with stage ${newGym.stage}`,
    });
    return newGym;
  }

  updateGymStage(id: string, stage: PipelineStage, lostReason?: LostReason, lostNotes?: string): Gym | undefined {
    const gym = this.getGymById(id);
    if (!gym) return undefined;
    const oldStage = gym.stage;
    gym.stage = stage;
    gym.updated_at = new Date().toISOString();
    if (stage === "LOST") {
      gym.lost_reason = lostReason;
      gym.lost_notes = lostNotes;
    } else {
      gym.lost_reason = undefined;
      gym.lost_notes = undefined;
    }

    this.logActivity({
      gym_id: gym.id,
      user_id: "usr_admin_1",
      user_name: "Operations",
      type: "STATUS_CHANGE",
      title: `Stage Changed: ${oldStage} → ${stage}`,
      description: stage === "LOST" ? `Marked Lost: ${lostReason || "No reason specified"}. Notes: ${lostNotes || "-"}` : `Moved to ${stage}`,
    });

    return gym;
  }

  // ----------------------------------------------------
  // Visits & Schedule
  // ----------------------------------------------------
  getVisits(): Visit[] {
    return this.visits;
  }

  getTodayVisits(): Visit[] {
    return this.visits.filter((v) => v.status === "SCHEDULED" || v.status === "COMPLETED");
  }

  scheduleVisit(data: Omit<Visit, "id" | "created_at" | "updated_at">): Visit {
    const newVisit: Visit = {
      ...data,
      id: `visit_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.visits.unshift(newVisit);

    // Also update gym stage if it was PROSPECT/CONTACTED
    const gym = this.getGymById(data.gym_id);
    if (gym && (gym.stage === "PROSPECT" || gym.stage === "CONTACTED")) {
      gym.stage = "VISIT_PLANNED";
    }

    this.logActivity({
      gym_id: data.gym_id,
      user_id: data.salesperson_id,
      user_name: data.salesperson_name,
      type: "VISIT",
      title: "Field Visit Scheduled",
      description: `Visit scheduled for ${data.time_slot} at ${data.gym_name} with ${data.owner_name}`,
    });

    return newVisit;
  }

  submitVisitReport(
    visitId: string,
    reportData: Partial<Visit>
  ): Visit | undefined {
    const visit = this.visits.find((v) => v.id === visitId);
    if (!visit) return undefined;

    Object.assign(visit, reportData, {
      status: "COMPLETED",
      updated_at: new Date().toISOString(),
    });

    // Update gym stage if visited
    const gym = this.getGymById(visit.gym_id);
    if (gym) {
      if (reportData.demo_required) {
        gym.stage = "DEMO_SCHEDULED";
      } else {
        gym.stage = "VISITED";
      }
      gym.updated_at = new Date().toISOString();
    }

    // Auto-create follow-up if date is provided
    if (reportData.next_followup_date) {
      this.createFollowUp({
        gym_id: visit.gym_id,
        gym_name: visit.gym_name,
        contact_name: reportData.person_met || visit.owner_name,
        due_date: reportData.next_followup_date,
        assigned_to_id: visit.salesperson_id,
        assigned_to_name: visit.salesperson_name,
        type: "WHATSAPP",
        status: "PENDING",
        notes: reportData.next_action || "Follow-up after field visit",
      });
    }

    this.logActivity({
      gym_id: visit.gym_id,
      user_id: visit.salesperson_id,
      user_name: visit.salesperson_name,
      type: "VISIT",
      title: "Visit Report Submitted",
      description: `Outcome: ${reportData.outcome || "Visit completed"}. Main pain point: ${reportData.main_pain_point || "None reported"}`,
    });

    return visit;
  }

  // ----------------------------------------------------
  // Follow-ups
  // ----------------------------------------------------
  getFollowUps(): FollowUp[] {
    return this.followUps;
  }

  createFollowUp(data: Omit<FollowUp, "id" | "created_at">): FollowUp {
    const fup: FollowUp = {
      ...data,
      id: `fup_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.followUps.unshift(fup);
    return fup;
  }

  completeFollowUp(id: string): FollowUp | undefined {
    const fup = this.followUps.find((f) => f.id === id);
    if (fup) {
      fup.status = "COMPLETED";
      this.logActivity({
        gym_id: fup.gym_id,
        user_id: fup.assigned_to_id,
        user_name: fup.assigned_to_name,
        type: "CALL",
        title: `Follow-up Completed (${fup.type})`,
        description: fup.notes || "Follow-up item resolved",
      });
    }
    return fup;
  }

  // ----------------------------------------------------
  // Activities / Gym Timeline
  // ----------------------------------------------------
  getActivities(gymId?: string): ActivityTimelineItem[] {
    if (gymId) {
      return this.activities.filter((a) => a.gym_id === gymId);
    }
    return this.activities;
  }

  logActivity(data: Omit<ActivityTimelineItem, "id" | "created_at">): ActivityTimelineItem {
    const item: ActivityTimelineItem = {
      ...data,
      id: `act_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.activities.unshift(item);
    return item;
  }

  // ----------------------------------------------------
  // Modules & Features
  // ----------------------------------------------------
  getModules(): RepsiModule[] {
    return this.modules;
  }

  getModuleById(id: string): RepsiModule | undefined {
    return this.modules.find((m) => m.id === id);
  }

  getFeatures(moduleId?: string): Feature[] {
    if (moduleId) {
      return this.features.filter((f) => f.module_id === moduleId);
    }
    return this.features;
  }

  createFeature(data: Omit<Feature, "id" | "created_at">): Feature {
    const feat: Feature = {
      ...data,
      id: `feat_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.features.push(feat);
    return feat;
  }

  // ----------------------------------------------------
  // Tasks
  // ----------------------------------------------------
  getTasks(): Task[] {
    return this.tasks;
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  createTask(data: Omit<Task, "id" | "created_at" | "updated_at">): Task {
    const newTask: Task = {
      ...data,
      id: `task_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.tasks.unshift(newTask);
    return newTask;
  }

  updateTaskStatus(id: string, status: Task["status"]): Task | undefined {
    const task = this.getTaskById(id);
    if (task) {
      task.status = status;
      task.updated_at = new Date().toISOString();
    }
    return task;
  }

  // ----------------------------------------------------
  // Bugs
  // ----------------------------------------------------
  getBugs(): Bug[] {
    return this.bugs;
  }

  getBugById(id: string): Bug | undefined {
    return this.bugs.find((b) => b.id === id);
  }

  createBug(data: Omit<Bug, "id" | "bug_id" | "created_at" | "updated_at">): Bug {
    const bugNum = 1040 + this.bugs.length + 1;
    const newBug: Bug = {
      ...data,
      id: `bug_${Date.now()}`,
      bug_id: `BUG-${bugNum}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.bugs.unshift(newBug);
    return newBug;
  }

  updateBugStatus(id: string, status: Bug["status"]): Bug | undefined {
    const bug = this.getBugById(id);
    if (bug) {
      bug.status = status;
      if (status === "FIXED" || status === "CLOSED") {
        bug.fixed_date = new Date().toISOString().split("T")[0];
      }
      bug.updated_at = new Date().toISOString();
    }
    return bug;
  }

  // ----------------------------------------------------
  // Blockers
  // ----------------------------------------------------
  getBlockers(): Blocker[] {
    return this.blockers;
  }

  resolveBlocker(id: string): Blocker | undefined {
    const blk = this.blockers.find((b) => b.id === id);
    if (blk) {
      blk.status = "RESOLVED";
      // Update linked task if needed
      const task = this.getTaskById(blk.task_id);
      if (task && task.status === "BLOCKED") {
        task.status = "IN_PROGRESS";
        task.blocker_reason = undefined;
      }
    }
    return blk;
  }

  // ----------------------------------------------------
  // Daily Logs
  // ----------------------------------------------------
  getDailyLogs(): DailyWorkLog[] {
    return this.dailyLogs;
  }

  createDailyLog(data: Omit<DailyWorkLog, "id" | "created_at">): DailyWorkLog {
    const existingIndex = this.dailyLogs.findIndex(
      (l) => l.user_id === data.user_id && l.date === data.date
    );
    const newLog: DailyWorkLog = {
      ...data,
      id: existingIndex >= 0 ? this.dailyLogs[existingIndex].id : `log_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.dailyLogs[existingIndex] = newLog;
    } else {
      this.dailyLogs.unshift(newLog);
    }
    return newLog;
  }

  // ----------------------------------------------------
  // Feature Requests & Feedback
  // ----------------------------------------------------
  getFeatureRequests(): FeatureRequest[] {
    return this.featureRequests;
  }

  createFeatureRequest(
    data: Omit<FeatureRequest, "id" | "request_code" | "created_at" | "updated_at">
  ): FeatureRequest {
    const reqCode = `FR-${100 + this.featureRequests.length + 1}`;
    const newFr: FeatureRequest = {
      ...data,
      id: `fr_${Date.now()}`,
      request_code: reqCode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.featureRequests.unshift(newFr);

    if (data.gym_id) {
      this.logActivity({
        gym_id: data.gym_id,
        user_id: "usr_admin_1",
        user_name: data.requested_by,
        type: "FEATURE_REQUEST",
        title: `Feature Request Logged: ${reqCode}`,
        description: data.title,
      });
    }

    return newFr;
  }

  // ----------------------------------------------------
  // Releases
  // ----------------------------------------------------
  getReleases(): Release[] {
    return this.releases;
  }

  getReleaseById(id: string): Release | undefined {
    return this.releases.find((r) => r.id === id);
  }

  // ----------------------------------------------------
  // Notifications
  // ----------------------------------------------------
  getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  markNotificationRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) notif.is_read = true;
  }

  // ----------------------------------------------------
  // Global Unified Search
  // ----------------------------------------------------
  search(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return { gyms: [], tasks: [], bugs: [], modules: [], featureRequests: [] };

    return {
      gyms: this.gyms.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.owner_name.toLowerCase().includes(q) ||
          g.city.toLowerCase().includes(q) ||
          g.phone.includes(q)
      ),
      tasks: this.tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.module_name.toLowerCase().includes(q) ||
          t.assignee_name.toLowerCase().includes(q)
      ),
      bugs: this.bugs.filter(
        (b) =>
          b.bug_id.toLowerCase().includes(q) ||
          b.title.toLowerCase().includes(q) ||
          b.module_name.toLowerCase().includes(q)
      ),
      modules: this.modules.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.code.toLowerCase().includes(q) ||
          m.owner_name.toLowerCase().includes(q)
      ),
      featureRequests: this.featureRequests.filter(
        (fr) =>
          fr.request_code.toLowerCase().includes(q) ||
          fr.title.toLowerCase().includes(q) ||
          (fr.gym_name && fr.gym_name.toLowerCase().includes(q))
      ),
    };
  }
}

// Global Singleton Store
const globalForOps = globalThis as unknown as { opsStore: OperationalDataStore };

export const opsStore = globalForOps.opsStore || new OperationalDataStore();

if (process.env.NODE_ENV !== "production") {
  globalForOps.opsStore = opsStore;
}
