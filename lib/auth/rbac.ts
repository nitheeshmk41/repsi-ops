import { UserRole } from "@/types";

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  children?: { title: string; href: string; badge?: string }[];
}

export function canAccessRoute(
  roleOrRoles: UserRole | UserRole[] | undefined,
  pathname: string
): boolean {
  if (!roleOrRoles) return false;
  const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];

  if (roles.includes("ADMIN") || roles.includes("FOUNDER")) return true;

  return roles.some((role) => {
    if (pathname.startsWith("/crm") || pathname.startsWith("/sales")) {
      return ["SALES", "MARKETING", "CUSTOMER_SUCCESS"].includes(role);
    }

    if (pathname.startsWith("/product") || pathname.startsWith("/project")) {
      return ["PROJECT_MANAGER", "DEVELOPER", "QA"].includes(role);
    }

    if (pathname.startsWith("/bugs")) {
      return ["PROJECT_MANAGER", "DEVELOPER", "QA", "CUSTOMER_SUCCESS"].includes(role);
    }

    if (pathname.startsWith("/reports")) {
      return ["PROJECT_MANAGER", "SALES"].includes(role);
    }

    if (pathname.startsWith("/team")) {
      return ["PROJECT_MANAGER"].includes(role);
    }

    // Dashboard and settings are accessible to all roles
    return true;
  });
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Founder / Admin",
  FOUNDER: "Founder / Admin",
  SALES: "Field Sales",
  PROJECT_MANAGER: "Project Manager",
  DEVELOPER: "Software Engineer",
  QA: "QA Engineer",
  MARKETING: "Growth & Marketing",
  CUSTOMER_SUCCESS: "Customer Success",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  ADMIN: "Full system administration, revenue analytics, module architecture, release management.",
  FOUNDER: "Executive view, company KPIs, pipeline status, product strategy, critical blockers.",
  SALES: "Gym lead tracking, visits schedule, follow-up reminders, deal pipeline, visit reporting.",
  PROJECT_MANAGER: "Module roadmap, sprint tasks, blocker resolution, release tracking, workload balance.",
  DEVELOPER: "Active task execution, code reviews, bug fixes, daily work log submissions.",
  QA: "Bug reproduction, severity triage, test suite execution, release verification signoff.",
  MARKETING: "Lead attribution, gym conversion patterns, customer engagement analysis.",
  CUSTOMER_SUCCESS: "Gym onboarding health, customer satisfaction feedback, feature request tracking.",
};

export function roleToAppwriteLabel(role: string): string {
  return role.replace(/[^a-zA-Z0-9]/g, "");
}

export function appwriteLabelToRole(label: string): UserRole {
  const clean = label.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (clean === "PROJECTMANAGER") return "PROJECT_MANAGER";
  if (clean === "CUSTOMERSUCCESS") return "CUSTOMER_SUCCESS";
  return clean as UserRole;
}
