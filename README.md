# REPSI OPS — Internal Operations Platform
**ops.repsi.app**

**REPSI Ops** is the production internal operating system for REPSI, an all-in-one fitness management SaaS for gyms, fitness studios, trainers, and fitness businesses.

It connects the entire company operating chain:
```
GYM / LEAD
   ↓
SALES ACTIVITY / VISITS
   ↓
CUSTOMER CONVERSION
   ↓
CUSTOMER FEEDBACK
   ↓
FEATURE REQUEST (FR-102)
   ↓
PRODUCT MODULE (Attendance, Payments, etc.)
   ↓
SPRINT TASK
   ↓
BUG TRIAGE & QA VERIFICATION
   ↓
PRODUCT RELEASE (v1.5.0)
```

---

## Architecture & Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript (Strict), Tailwind CSS, Lucide Icons, shadcn/ui design language, React Bits micro-animations.
- **Backend & Auth**: Appwrite Authentication (Email/Password, SSR Sessions, JWT, Teams/Presences).
- **Primary Database Layer**: **Appwrite Databases / TablesDB** fully managed serverless document/relational tables with structured schemas.
- **File Storage**: Appwrite Storage (Field visit voice notes, gym attachments, bug reproduction screenshots).
- **Role-Based Access Control**: First-class RBAC with role personas (Admin/Founder, Sales, Project Manager, Developer, QA, Marketing, Customer Success).

---

## 1. Requirements

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Appwrite Project**: Appwrite Cloud account (free tier) or self-hosted Appwrite 2.x

---

## 2. Installation

Clone repository and install dependencies:

```bash
git clone https://github.com/repsi-app/repsi-ops.git
cd repsi-ops
npm install
```

---

## 3. Environment Variables

Copy the template `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your variables:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Appwrite Cloud endpoint (`https://cloud.appwrite.io/v1` or region endpoint) |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | Your Appwrite project ID |
| `APPWRITE_API_KEY` | Server-side secret key from Appwrite Console with Database & Users scopes |
| `NEXT_PUBLIC_APPWRITE_DATABASE_ID` | Appwrite database ID (`repsi_ops_db`) |
| `NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET` | Storage bucket for attachments (`repsi_attachments`) |

---

## 4. Appwrite Setup

1. Create a project named **REPSI Ops** on [Appwrite Cloud](https://cloud.appwrite.io).
2. Under **Auth**:
   - Enable **Email/Password** authentication.
   - Set Session length to 30 days.
3. Under **Databases**:
   - Use Appwrite TablesDB: database ID `repsi_ops_db`.
4. Under **API Keys**:
   - Create an API key with scopes:
     - `databases.*`, `collections.*`, `attributes.*`, `indexes.*`, `documents.*`
     - `users.*`, `files.*`, `buckets.*`
5. Run the schema provisioner:
   ```bash
   npx tsx --env-file=.env scripts/setup-appwrite-tablesdb.ts
   ```
- `follow_ups`
- `activities` (Gym Activity Timeline)
- `modules` (Attendance, Membership, Payments, Trainer, Reports, Notifications)
- `features` & `tasks`
- `bugs` (Decoupled Severity vs Priority)
- `blockers` (Impediments and resolution ownership)
- `daily_work_logs` (Daily standups)
- `feature_requests` (Connected to gyms, modules, and target releases)
- `releases` (v1.5.0, v1.6.0)
- `notifications` & `audit_logs`

---

## 6. Authentication & Roles

REPSI Ops implements role-based route guards and UI adapting to each team member's operational role:

- **ADMIN / FOUNDER**: Full access, executive KPIs, blockers, releases.
- **SALES**: Fitness CRM, Leads, Field Visits, Today's Schedule, Visit Reports, Follow-ups.
- **PROJECT_MANAGER**: Modules, Sprints, Tasks, Blocker tracking, Releases, Workload.
- **DEVELOPER**: Assigned tasks, Bugs, Code review, Daily standup logs, My Work.
- **QA**: Bug triage, Severity triage, QA Testing suite, Release verification signoff.
- **MARKETING**: Lead attribution, gym pipeline, customer conversion.
- **CUSTOMER_SUCCESS**: Customer feedback, feature requests, onboarding issues.

> **Fast Role Switcher**: A switcher in the top navigation bar allows internal team members and reviewers to instantly simulate and test the platform from any role perspective.

---

## 7. Local Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app includes realistic seed data and an operational store that works out-of-the-box.

---

## 8. Production Build

Verify TypeScript strict types and compile bundle:

```bash
npm run build
npm run start
```

---

## 9. Deployment to Vercel (Recommended)

1. Push code to your GitHub / GitLab repository.
2. Import project into [Vercel](https://vercel.com).
3. Set Environment Variables in Vercel Project Settings (`NEXT_PUBLIC_APPWRITE_ENDPOINT`, `NEXT_PUBLIC_APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`, `DATABASE_URL`).
4. Set custom domain: `ops.repsi.app`.
5. Deploy! Zero paid infrastructure required (fits on Vercel Free Tier + Appwrite Free Tier).

---

## 10. Seed Data

The platform comes pre-seeded with realistic fitness SaaS data:
- **Gyms**: ABC Fitness (Peelamedu), FitZone Studio (Race Course), PowerHouse Gym (Gandhipuram), Elite Fitness (RS Puram), IronForge Arena.
- **Modules**: Attendance (70%), Membership (100%), Payments (90%), Trainer (50%), Reports (25%), Notifications (30%).
- **Bugs**: BUG-1042 (Attendance renewal count), BUG-1043 (Critical P0 mobile webhook error), BUG-1044 (Dashboard loading).
- **Feature Requests**: FR-102 (WhatsApp automated renewal reminder directly requested by ABC Fitness).
- **Releases**: REPSI v1.5.0 (October 15, 2026), REPSI v1.6.0 (November 2026).

---

## License

Proprietary — REPSI Internal Team. Unauthorized distribution prohibited.
