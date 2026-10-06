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

const STORAGE_KEY = "repsi_ops_store_v2";

interface StoreState {
  users: UserProfile[];
  gyms: Gym[];
  visits: Visit[];
  followUps: FollowUp[];
  activities: ActivityTimelineItem[];
  modules: RepsiModule[];
  features: Feature[];
  tasks: Task[];
  bugs: Bug[];
  blockers: Blocker[];
  dailyLogs: DailyWorkLog[];
  featureRequests: FeatureRequest[];
  releases: Release[];
  notifications: NotificationItem[];
}

// Persistent operational store with browser LocalStorage backup
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

  private listeners: Set<() => void> = new Set();
  private isHydrated: boolean = false;

  constructor() {
    this.initFromStorage();
  }

  // Hydrate from localStorage in browser environment without triggering spurious notify
  private initFromStorage() {
    if (typeof window !== "undefined" && !this.isHydrated) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data: Partial<StoreState> = JSON.parse(stored);
          if (Array.isArray(data.gyms) && data.gyms.length > 0) this.gyms = data.gyms;
          if (Array.isArray(data.visits) && data.visits.length > 0) this.visits = data.visits;
          if (Array.isArray(data.followUps) && data.followUps.length > 0) this.followUps = data.followUps;
          if (Array.isArray(data.activities) && data.activities.length > 0) this.activities = data.activities;
          if (Array.isArray(data.tasks) && data.tasks.length > 0) this.tasks = data.tasks;
          if (Array.isArray(data.bugs) && data.bugs.length > 0) this.bugs = data.bugs;
          if (Array.isArray(data.blockers) && data.blockers.length > 0) this.blockers = data.blockers;
          if (Array.isArray(data.dailyLogs) && data.dailyLogs.length > 0) this.dailyLogs = data.dailyLogs;
          if (Array.isArray(data.featureRequests) && data.featureRequests.length > 0) this.featureRequests = data.featureRequests;
          if (Array.isArray(data.modules) && data.modules.length > 0) this.modules = data.modules;
          if (Array.isArray(data.features) && data.features.length > 0) this.features = data.features;
          if (Array.isArray(data.releases) && data.releases.length > 0) this.releases = data.releases;
          if (Array.isArray(data.users) && data.users.length > 0) this.users = data.users;
          if (Array.isArray(data.notifications) && data.notifications.length > 0) this.notifications = data.notifications;
        }
      } catch (err) {
        console.warn("Failed to read from localStorage:", err);
      } finally {
        this.isHydrated = true;
      }
    }
  }

  public ensureHydrated() {
    if (!this.isHydrated && typeof window !== "undefined") {
      this.initFromStorage();
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      try {
        const state: StoreState = {
          users: this.users,
          gyms: this.gyms,
          visits: this.visits,
          followUps: this.followUps,
          activities: this.activities,
          modules: this.modules,
          features: this.features,
          tasks: this.tasks,
          bugs: this.bugs,
          blockers: this.blockers,
          dailyLogs: this.dailyLogs,
          featureRequests: this.featureRequests,
          releases: this.releases,
          notifications: this.notifications,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.warn("Failed to write to localStorage:", err);
      }
    }
    this.notify();
  }

  // Subscribe to changes
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error(e);
      }
    });
  }

  // Reset to default seed data
  public resetToDefaults() {
    this.users = [...SEED_USERS];
    this.gyms = [...SEED_GYMS];
    this.visits = [...SEED_VISITS];
    this.followUps = [...SEED_FOLLOWUPS];
    this.activities = [...SEED_ACTIVITIES];
    this.modules = [...SEED_MODULES];
    this.features = [...SEED_FEATURES];
    this.tasks = [...SEED_TASKS];
    this.bugs = [...SEED_BUGS];
    this.blockers = [...SEED_BLOCKERS];
    this.dailyLogs = [...SEED_DAILY_LOGS];
    this.featureRequests = [...SEED_FEATURE_REQUESTS];
    this.releases = [...SEED_RELEASES];
    this.notifications = [...SEED_NOTIFICATIONS];
    this.saveToStorage();
  }

  // ----------------------------------------------------
  // Users
  // ----------------------------------------------------
  getUsers(): UserProfile[] {
    this.ensureHydrated();
    return this.users;
  }

  getUserById(id: string): UserProfile | undefined {
    this.ensureHydrated();
    return this.users.find((u) => u.id === id);
  }

  createUser(data: Omit<UserProfile, "id" | "created_at">): UserProfile {
    this.ensureHydrated();
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
    this.saveToStorage();
    return newUser;
  }

  updateUser(id: string, data: Partial<UserProfile>): UserProfile | undefined {
    this.ensureHydrated();
    const user = this.getUserById(id);
    if (!user) return undefined;
    Object.assign(user, data);
    this.saveToStorage();
    return user;
  }

  deleteUser(id: string): boolean {
    this.ensureHydrated();
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx >= 0) {
      this.users.splice(idx, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // ----------------------------------------------------
  // Gyms & CRM
  // ----------------------------------------------------
  getGyms(): Gym[] {
    this.ensureHydrated();
    return this.gyms;
  }

  getGymById(id: string): Gym | undefined {
    this.ensureHydrated();
    return this.gyms.find((g) => g.id === id);
  }

  createGym(data: Omit<Gym, "id" | "created_at" | "updated_at">): Gym {
    this.ensureHydrated();
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
    this.saveToStorage();
    return newGym;
  }

  updateGym(id: string, data: Partial<Gym>): Gym | undefined {
    this.ensureHydrated();
    const gym = this.getGymById(id);
    if (!gym) return undefined;
    Object.assign(gym, data, {
      updated_at: new Date().toISOString(),
    });
    this.logActivity({
      gym_id: gym.id,
      user_id: "usr_admin_1",
      user_name: "Operations",
      type: "STATUS_CHANGE",
      title: "Lead Details Updated",
      description: `Updated info for ${gym.name}`,
    });
    this.saveToStorage();
    return gym;
  }

  deleteGym(id: string): boolean {
    this.ensureHydrated();
    const index = this.gyms.findIndex((g) => g.id === id);
    if (index >= 0) {
      this.gyms.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  updateGymStage(id: string, stage: PipelineStage, lostReason?: LostReason, lostNotes?: string): Gym | undefined {
    this.ensureHydrated();
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

    this.saveToStorage();
    return gym;
  }

  // ----------------------------------------------------
  // Visits & Schedule
  // ----------------------------------------------------
  getVisits(): Visit[] {
    this.ensureHydrated();
    return this.visits;
  }

  getTodayVisits(): Visit[] {
    this.ensureHydrated();
    return this.visits.filter((v) => v.status === "SCHEDULED" || v.status === "COMPLETED");
  }

  scheduleVisit(data: Omit<Visit, "id" | "created_at" | "updated_at">): Visit {
    this.ensureHydrated();
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

    this.saveToStorage();
    return newVisit;
  }

  submitVisitReport(
    visitId: string,
    reportData: Partial<Visit>
  ): Visit | undefined {
    this.ensureHydrated();
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

    this.saveToStorage();
    return visit;
  }

  // ----------------------------------------------------
  // Follow-ups
  // ----------------------------------------------------
  getFollowUps(): FollowUp[] {
    this.ensureHydrated();
    return this.followUps;
  }

  createFollowUp(data: Omit<FollowUp, "id" | "created_at">): FollowUp {
    this.ensureHydrated();
    const fup: FollowUp = {
      ...data,
      id: `fup_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.followUps.unshift(fup);
    this.saveToStorage();
    return fup;
  }

  completeFollowUp(id: string): FollowUp | undefined {
    this.ensureHydrated();
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
      this.saveToStorage();
    }
    return fup;
  }

  // ----------------------------------------------------
  // Activities / Gym Timeline
  // ----------------------------------------------------
  getActivities(gymId?: string): ActivityTimelineItem[] {
    this.ensureHydrated();
    if (gymId) {
      return this.activities.filter((a) => a.gym_id === gymId);
    }
    return this.activities;
  }

  logActivity(data: Omit<ActivityTimelineItem, "id" | "created_at">): ActivityTimelineItem {
    this.ensureHydrated();
    const item: ActivityTimelineItem = {
      ...data,
      id: `act_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.activities.unshift(item);
    this.saveToStorage();
    return item;
  }

  // ----------------------------------------------------
  // Modules & Features
  // ----------------------------------------------------
  getModules(): RepsiModule[] {
    this.ensureHydrated();
    return this.modules;
  }

  getModuleById(id: string): RepsiModule | undefined {
    this.ensureHydrated();
    return this.modules.find((m) => m.id === id);
  }

  createModule(data: Omit<RepsiModule, "id" | "created_at" | "updated_at">): RepsiModule {
    this.ensureHydrated();
    const newModule: RepsiModule = {
      ...data,
      id: `mod_${Date.now()}`,
      features_count: data.features_count ?? 0,
      tasks_count: data.tasks_count ?? 0,
      bugs_count: data.bugs_count ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.modules.unshift(newModule);
    this.saveToStorage();
    return newModule;
  }

  updateModule(id: string, data: Partial<RepsiModule>): RepsiModule | undefined {
    this.ensureHydrated();
    const mod = this.getModuleById(id);
    if (!mod) return undefined;
    Object.assign(mod, { ...data, updated_at: new Date().toISOString() });
    this.saveToStorage();
    return mod;
  }

  deleteModule(id: string): boolean {
    this.ensureHydrated();
    const idx = this.modules.findIndex((m) => m.id === id);
    if (idx >= 0) {
      this.modules.splice(idx, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  getFeatures(moduleId?: string): Feature[] {
    this.ensureHydrated();
    if (moduleId) {
      return this.features.filter((f) => f.module_id === moduleId);
    }
    return this.features;
  }

  createFeature(data: Omit<Feature, "id" | "created_at">): Feature {
    this.ensureHydrated();
    const feat: Feature = {
      ...data,
      id: `feat_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.features.push(feat);
    this.saveToStorage();
    return feat;
  }

  // ----------------------------------------------------
  // Tasks
  // ----------------------------------------------------
  getTasks(): Task[] {
    this.ensureHydrated();
    return this.tasks;
  }

  getTaskById(id: string): Task | undefined {
    this.ensureHydrated();
    return this.tasks.find((t) => t.id === id);
  }

  createTask(data: Omit<Task, "id" | "created_at" | "updated_at">): Task {
    this.ensureHydrated();
    const newTask: Task = {
      ...data,
      id: `task_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.tasks.unshift(newTask);
    this.saveToStorage();
    return newTask;
  }

  updateTaskStatus(id: string, status: Task["status"]): Task | undefined {
    this.ensureHydrated();
    const task = this.getTaskById(id);
    if (task) {
      task.status = status;
      task.updated_at = new Date().toISOString();
      this.saveToStorage();
    }
    return task;
  }

  // ----------------------------------------------------
  // Bugs
  // ----------------------------------------------------
  getBugs(): Bug[] {
    this.ensureHydrated();
    return this.bugs;
  }

  getBugById(id: string): Bug | undefined {
    this.ensureHydrated();
    return this.bugs.find((b) => b.id === id);
  }

  createBug(data: Omit<Bug, "id" | "bug_id" | "created_at" | "updated_at">): Bug {
    this.ensureHydrated();
    const bugNum = 1040 + this.bugs.length + 1;
    const newBug: Bug = {
      ...data,
      id: `bug_${Date.now()}`,
      bug_id: `BUG-${bugNum}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.bugs.unshift(newBug);
    this.saveToStorage();
    return newBug;
  }

  updateBugStatus(id: string, status: Bug["status"]): Bug | undefined {
    this.ensureHydrated();
    const bug = this.getBugById(id);
    if (bug) {
      bug.status = status;
      if (status === "FIXED" || status === "CLOSED") {
        bug.fixed_date = new Date().toISOString().split("T")[0];
      }
      bug.updated_at = new Date().toISOString();
      this.saveToStorage();
    }
    return bug;
  }

  // ----------------------------------------------------
  // Blockers
  // ----------------------------------------------------
  getBlockers(): Blocker[] {
    this.ensureHydrated();
    return this.blockers;
  }

  resolveBlocker(id: string): Blocker | undefined {
    this.ensureHydrated();
    const blk = this.blockers.find((b) => b.id === id);
    if (blk) {
      blk.status = "RESOLVED";
      // Update linked task if needed
      const task = this.getTaskById(blk.task_id);
      if (task && task.status === "BLOCKED") {
        task.status = "IN_PROGRESS";
        task.blocker_reason = undefined;
      }
      this.saveToStorage();
    }
    return blk;
  }

  // ----------------------------------------------------
  // Daily Logs
  // ----------------------------------------------------
  getDailyLogs(): DailyWorkLog[] {
    this.ensureHydrated();
    return this.dailyLogs;
  }

  createDailyLog(data: Omit<DailyWorkLog, "id" | "created_at">): DailyWorkLog {
    this.ensureHydrated();
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
    this.saveToStorage();
    return newLog;
  }

  // ----------------------------------------------------
  // Feature Requests & Feedback
  // ----------------------------------------------------
  getFeatureRequests(): FeatureRequest[] {
    this.ensureHydrated();
    return this.featureRequests;
  }

  createFeatureRequest(
    data: Omit<FeatureRequest, "id" | "request_code" | "created_at" | "updated_at">
  ): FeatureRequest {
    this.ensureHydrated();
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

    this.saveToStorage();
    return newFr;
  }

  // ----------------------------------------------------
  // Releases
  // ----------------------------------------------------
  getReleases(): Release[] {
    this.ensureHydrated();
    return this.releases;
  }

  getReleaseById(id: string): Release | undefined {
    this.ensureHydrated();
    return this.releases.find((r) => r.id === id);
  }

  // ----------------------------------------------------
  // Notifications
  // ----------------------------------------------------
  getNotifications(): NotificationItem[] {
    this.ensureHydrated();
    return this.notifications;
  }

  markNotificationRead(id: string) {
    this.ensureHydrated();
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      this.saveToStorage();
    }
  }

  // ----------------------------------------------------
  // Global Unified Search
  // ----------------------------------------------------
  search(query: string) {
    this.ensureHydrated();
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
