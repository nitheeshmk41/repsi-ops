import { Client, Databases, Permission, Role, ID } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6ac3dc080031ce673bdf";
const apiKey = process.env.APPWRITE_API_KEY || "";
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "repsi_ops_db";

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);

const defaultPermissions = [
  Permission.read(Role.any()),
  Permission.create(Role.any()),
  Permission.update(Role.any()),
  Permission.delete(Role.any()),
];

async function setup() {
  console.log(`Setting up Appwrite TablesDB: ${databaseId}...`);

  // 1. Create or verify database
  try {
    await databases.get(databaseId);
    console.log(`Database ${databaseId} already exists.`);
  } catch (err: any) {
    if (err.code === 404) {
      console.log(`Creating database ${databaseId}...`);
      await databases.create(databaseId, "Repsi Ops TablesDB");
      console.log(`Database ${databaseId} created successfully.`);
    } else {
      throw err;
    }
  }

  // Helper to create collection if not exists
  const ensureCollection = async (collectionId: string, name: string) => {
    try {
      await databases.getCollection(databaseId, collectionId);
      console.log(`Collection '${collectionId}' already exists.`);
    } catch (err: any) {
      if (err.code === 404) {
        console.log(`Creating collection '${collectionId}' (${name})...`);
        await databases.createCollection(
          databaseId,
          collectionId,
          name,
          defaultPermissions
        );
        console.log(`Collection '${collectionId}' created.`);
      } else {
        throw err;
      }
    }
  };

  // Helper to create string attribute safely
  const ensureString = async (colId: string, key: string, size: number, required = false, defaultValue?: string) => {
    try {
      await databases.createStringAttribute(databaseId, colId, key, size, required, defaultValue);
      console.log(`  + [${colId}] string attribute: ${key}`);
    } catch (err: any) {
      if (err.code !== 409) console.log(`  ! [${colId}] attr ${key}:`, err.message);
    }
  };

  // Helper to create integer attribute safely
  const ensureInteger = async (colId: string, key: string, required = false, min?: number, max?: number, defaultValue?: number) => {
    try {
      await databases.createIntegerAttribute(databaseId, colId, key, required, min, max, defaultValue);
      console.log(`  + [${colId}] int attribute: ${key}`);
    } catch (err: any) {
      if (err.code !== 409) console.log(`  ! [${colId}] attr ${key}:`, err.message);
    }
  };

  // Helper to create boolean attribute safely
  const ensureBoolean = async (colId: string, key: string, required = false, defaultValue?: boolean) => {
    try {
      await databases.createBooleanAttribute(databaseId, colId, key, required, defaultValue);
      console.log(`  + [${colId}] bool attribute: ${key}`);
    } catch (err: any) {
      if (err.code !== 409) console.log(`  ! [${colId}] attr ${key}:`, err.message);
    }
  };

  // Helper to create float attribute safely
  const ensureFloat = async (colId: string, key: string, required = false, min?: number, max?: number, defaultValue?: number) => {
    try {
      await databases.createFloatAttribute(databaseId, colId, key, required, min, max, defaultValue);
      console.log(`  + [${colId}] float attribute: ${key}`);
    } catch (err: any) {
      if (err.code !== 409) console.log(`  ! [${colId}] attr ${key}:`, err.message);
    }
  };

  // 1. gyms collection
  await ensureCollection("gyms", "Gyms & Leads");
  await ensureString("gyms", "name", 255, true);
  await ensureString("gyms", "owner_name", 255, true);
  await ensureString("gyms", "phone", 50, true);
  await ensureString("gyms", "whatsapp", 50, false);
  await ensureString("gyms", "email", 255, false);
  await ensureString("gyms", "website", 500, false);
  await ensureString("gyms", "instagram", 255, false);
  await ensureString("gyms", "address", 500, false);
  await ensureString("gyms", "area", 100, false);
  await ensureString("gyms", "city", 100, false);
  await ensureString("gyms", "business_type", 50, false, "Gym");
  await ensureInteger("gyms", "members_count", false, 0, 100000, 0);
  await ensureInteger("gyms", "trainers_count", false, 0, 1000, 0);
  await ensureInteger("gyms", "branches_count", false, 1, 1000, 1);
  await ensureString("gyms", "current_software", 255, false);
  await ensureString("gyms", "current_payment_system", 255, false);
  await ensureString("gyms", "business_size", 50, false, "Medium");
  await ensureString("gyms", "stage", 50, false, "PROSPECT");
  await ensureString("gyms", "lost_reason", 255, false);
  await ensureString("gyms", "lost_notes", 1000, false);
  await ensureFloat("gyms", "expected_revenue", false, 0, 100000000, 0);
  await ensureString("gyms", "assigned_salesperson_id", 100, false);
  await ensureString("gyms", "assigned_salesperson_name", 255, false);

  // 2. visits collection
  await ensureCollection("visits", "Sales Visits");
  await ensureString("visits", "gym_id", 100, true);
  await ensureString("visits", "gym_name", 255, true);
  await ensureString("visits", "gym_area", 100, false);
  await ensureString("visits", "owner_name", 255, false);
  await ensureString("visits", "salesperson_id", 100, true);
  await ensureString("visits", "salesperson_name", 255, true);
  await ensureString("visits", "scheduled_at", 100, true);
  await ensureString("visits", "time_slot", 50, true);
  await ensureString("visits", "status", 50, false, "SCHEDULED");
  await ensureBoolean("visits", "met_owner", false, false);
  await ensureString("visits", "person_met", 255, false);
  await ensureString("visits", "role_of_person_met", 100, false);
  await ensureBoolean("visits", "interested", false, true);
  await ensureBoolean("visits", "demo_required", false, false);
  await ensureString("visits", "current_software", 255, false);
  await ensureString("visits", "main_pain_point", 1000, false);
  await ensureFloat("visits", "budget", false, 0, 100000000, 0);
  await ensureString("visits", "expected_decision_date", 100, false);
  await ensureString("visits", "response_notes", 2000, false);
  await ensureString("visits", "next_followup_date", 100, false);
  await ensureString("visits", "next_action", 500, false);
  await ensureString("visits", "outcome", 255, false);

  // 3. follow_ups collection
  await ensureCollection("follow_ups", "Follow-ups");
  await ensureString("follow_ups", "gym_id", 100, true);
  await ensureString("follow_ups", "gym_name", 255, true);
  await ensureString("follow_ups", "contact_name", 255, false);
  await ensureString("follow_ups", "due_date", 100, true);
  await ensureString("follow_ups", "assigned_to_id", 100, true);
  await ensureString("follow_ups", "assigned_to_name", 255, true);
  await ensureString("follow_ups", "type", 50, false, "WHATSAPP");
  await ensureString("follow_ups", "status", 50, false, "PENDING");
  await ensureString("follow_ups", "notes", 1000, false);

  // 4. activities collection (Gym Activity Timeline)
  await ensureCollection("activities", "Activity Timeline");
  await ensureString("activities", "gym_id", 100, true);
  await ensureString("activities", "user_id", 100, true);
  await ensureString("activities", "user_name", 255, true);
  await ensureString("activities", "type", 50, true);
  await ensureString("activities", "title", 255, true);
  await ensureString("activities", "description", 2000, false);

  // 5. modules collection
  await ensureCollection("modules", "Product Modules");
  await ensureString("modules", "name", 255, true);
  await ensureString("modules", "code", 50, true);
  await ensureString("modules", "description", 2000, false);
  await ensureString("modules", "status", 50, false, "PLANNED");
  await ensureString("modules", "owner_id", 100, false);
  await ensureString("modules", "owner_name", 255, false);
  await ensureString("modules", "priority", 20, false, "P2");
  await ensureInteger("modules", "progress_percent", false, 0, 100, 0);
  await ensureString("modules", "deadline", 100, false);
  await ensureString("modules", "release_name", 100, false);

  // 6. features collection
  await ensureCollection("features", "Module Features");
  await ensureString("features", "module_id", 100, true);
  await ensureString("features", "module_name", 255, false);
  await ensureString("features", "name", 255, true);
  await ensureString("features", "description", 2000, false);
  await ensureString("features", "status", 50, false, "BACKLOG");
  await ensureString("features", "priority", 20, false, "P2");
  await ensureInteger("features", "requested_by_count", false, 0, 10000, 1);

  // 7. tasks collection
  await ensureCollection("tasks", "Engineering Tasks");
  await ensureString("tasks", "title", 255, true);
  await ensureString("tasks", "description", 2000, false);
  await ensureString("tasks", "module_id", 100, true);
  await ensureString("tasks", "module_name", 255, true);
  await ensureString("tasks", "assignee_id", 100, false);
  await ensureString("tasks", "assignee_name", 255, false);
  await ensureString("tasks", "priority", 20, false, "P2");
  await ensureString("tasks", "status", 50, false, "TODO");
  await ensureString("tasks", "due_date", 100, false);
  await ensureFloat("tasks", "estimated_hours", false, 0, 10000, 0);
  await ensureFloat("tasks", "actual_hours", false, 0, 10000, 0);
  await ensureString("tasks", "blocker_reason", 1000, false);

  // 8. bugs collection
  await ensureCollection("bugs", "Bugs & Regressions");
  await ensureString("bugs", "bug_id", 50, true);
  await ensureString("bugs", "title", 255, true);
  await ensureString("bugs", "description", 2000, false);
  await ensureString("bugs", "module_id", 100, true);
  await ensureString("bugs", "module_name", 255, true);
  await ensureString("bugs", "reporter_id", 100, false);
  await ensureString("bugs", "reporter_name", 255, false);
  await ensureString("bugs", "assigned_to_id", 100, false);
  await ensureString("bugs", "assigned_to_name", 255, false);
  await ensureString("bugs", "qa_owner_name", 255, false);
  await ensureString("bugs", "severity", 50, false, "MINOR");
  await ensureString("bugs", "priority", 20, false, "P2");
  await ensureString("bugs", "environment", 50, false, "Production");
  await ensureString("bugs", "app_version", 50, false, "v1.0.0");
  await ensureString("bugs", "expected_result", 2000, false);
  await ensureString("bugs", "actual_result", 2000, false);
  await ensureString("bugs", "steps_to_reproduce", 3000, false);
  await ensureString("bugs", "status", 50, false, "REPORTED");
  await ensureString("bugs", "due_date", 100, false);
  await ensureString("bugs", "fixed_date", 100, false);

  // 9. blockers collection
  await ensureCollection("blockers", "Engineering Blockers");
  await ensureString("blockers", "task_id", 100, true);
  await ensureString("blockers", "task_title", 255, true);
  await ensureString("blockers", "person_name", 255, true);
  await ensureString("blockers", "blocker_reason", 1000, true);
  await ensureString("blockers", "blocked_since", 100, true);
  await ensureString("blockers", "dependency_desc", 1000, false);
  await ensureString("blockers", "owner_responsible_name", 255, true);
  await ensureString("blockers", "expected_resolution_date", 100, false);
  await ensureString("blockers", "status", 50, false, "ACTIVE");

  // 10. daily_logs collection
  await ensureCollection("daily_logs", "Daily Work Logs");
  await ensureString("daily_logs", "user_id", 100, true);
  await ensureString("daily_logs", "user_name", 255, true);
  await ensureString("daily_logs", "date", 100, true);
  await ensureString("daily_logs", "completed_today", 3000, true);
  await ensureString("daily_logs", "in_progress", 3000, true);
  await ensureString("daily_logs", "blocked", 2000, false);
  await ensureString("daily_logs", "tomorrow_plan", 3000, true);

  // 11. feature_requests collection
  await ensureCollection("feature_requests", "Feature Requests");
  await ensureString("feature_requests", "request_code", 50, true);
  await ensureString("feature_requests", "gym_id", 100, false);
  await ensureString("feature_requests", "gym_name", 255, false);
  await ensureString("feature_requests", "requested_by", 255, true);
  await ensureString("feature_requests", "title", 255, true);
  await ensureString("feature_requests", "description", 2000, true);
  await ensureString("feature_requests", "business_problem", 2000, true);
  await ensureString("feature_requests", "priority", 20, false, "P2");
  await ensureInteger("feature_requests", "customers_count", false, 1, 10000, 1);
  await ensureString("feature_requests", "status", 50, false, "PROPOSED");
  await ensureString("feature_requests", "product_decision", 1000, false);
  await ensureString("feature_requests", "module_name", 255, false);
  await ensureString("feature_requests", "target_release_name", 100, false);

  // 12. releases collection
  await ensureCollection("releases", "Releases");
  await ensureString("releases", "version", 50, true);
  await ensureString("releases", "name", 255, true);
  await ensureString("releases", "release_date", 100, true);
  await ensureString("releases", "status", 50, false, "PLANNED");
  await ensureString("releases", "description", 2000, false);
  await ensureInteger("releases", "modules_count", false, 0, 1000, 0);
  await ensureInteger("releases", "features_count", false, 0, 1000, 0);
  await ensureInteger("releases", "tasks_count", false, 0, 1000, 0);
  await ensureInteger("releases", "bugs_count", false, 0, 1000, 0);

  // 13. user_profiles collection
  await ensureCollection("user_profiles", "User Profiles");
  await ensureString("user_profiles", "user_id", 100, true);
  await ensureString("user_profiles", "name", 255, true);
  await ensureString("user_profiles", "email", 255, true);
  await ensureString("user_profiles", "role", 50, true);
  await ensureString("user_profiles", "department", 100, false, "Operations");
  await ensureString("user_profiles", "phone", 50, false);

  console.log("All Appwrite TablesDB collections and attributes verified!");
}

setup().catch((e) => {
  console.error("Setup failed:", e);
});
