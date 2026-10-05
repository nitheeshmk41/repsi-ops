-- ==============================================================================
-- REPSI OPS: Production PostgreSQL Schema for Appwrite Managed PostgreSQL
-- ops.repsi.app - Internal Operations Platform
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users & Profiles (Synchronized with Appwrite Auth user IDs)
CREATE TABLE IF NOT EXISTS user_profiles (
    id VARCHAR(128) PRIMARY KEY, -- Appwrite User ID
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'ADMIN', 'FOUNDER', 'SALES', 'PROJECT_MANAGER', 'DEVELOPER', 'QA', 'MARKETING', 'CUSTOMER_SUCCESS'
    )),
    department VARCHAR(100) NOT NULL DEFAULT 'Operations',
    avatar_url TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Gyms & Fitness Businesses (Core CRM Entity)
CREATE TABLE IF NOT EXISTS gyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50),
    email VARCHAR(255),
    website TEXT,
    instagram TEXT,
    address TEXT NOT NULL,
    area VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    google_maps_url TEXT,
    business_type VARCHAR(50) NOT NULL CHECK (business_type IN (
        'Gym', 'Fitness Studio', 'CrossFit', 'Yoga', 'Personal Training',
        'Martial Arts', 'Sports Academy', 'Wellness Center', 'Multi-branch'
    )),
    members_count INT DEFAULT 0,
    trainers_count INT DEFAULT 0,
    branches_count INT DEFAULT 1,
    current_software VARCHAR(150),
    current_payment_system VARCHAR(150),
    business_size VARCHAR(50) DEFAULT 'Medium',
    stage VARCHAR(50) NOT NULL DEFAULT 'PROSPECT' CHECK (stage IN (
        'PROSPECT', 'CONTACTED', 'VISIT_PLANNED', 'VISITED', 'DEMO_SCHEDULED',
        'DEMO_COMPLETED', 'TRIAL', 'NEGOTIATION', 'WON', 'NOT_INTERESTED', 'LOST'
    )),
    lost_reason VARCHAR(100),
    lost_notes TEXT,
    expected_revenue NUMERIC(12, 2) DEFAULT 0.00,
    assigned_salesperson_id VARCHAR(128) REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Gym Contacts
CREATE TABLE IF NOT EXISTS gym_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'Manager',
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Visits & Field Sales Reports
CREATE TABLE IF NOT EXISTS visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    salesperson_id VARCHAR(128) NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN (
        'SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'
    )),
    met_owner BOOLEAN,
    person_met VARCHAR(255),
    role_of_person_met VARCHAR(100),
    interested BOOLEAN,
    demo_required BOOLEAN,
    current_software VARCHAR(150),
    main_pain_point TEXT,
    budget NUMERIC(12, 2),
    expected_decision_date DATE,
    response_notes TEXT,
    voice_note_url TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    next_followup_date DATE,
    next_action VARCHAR(255),
    outcome VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Follow-ups
CREATE TABLE IF NOT EXISTS follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    assigned_to_id VARCHAR(128) NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('CALL', 'WHATSAPP', 'VISIT', 'EMAIL', 'DEMO')),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Activity Timeline (Gym Timeline)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id VARCHAR(128) NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'VISIT', 'CALL', 'WHATSAPP', 'DEMO', 'NOTE', 'STATUS_CHANGE', 'FEEDBACK', 'FEATURE_REQUEST', 'CONVERSION'
    )),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Product Releases
CREATE TABLE IF NOT EXISTS releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version VARCHAR(50) UNIQUE NOT NULL, -- e.g. v1.5.0
    name VARCHAR(255) NOT NULL,
    release_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNED' CHECK (status IN (
        'PLANNED', 'IN_PROGRESS', 'QA_VERIFICATION', 'RELEASED'
    )),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Product Modules
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g. ATTENDANCE, MEMBERSHIP
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNED' CHECK (status IN (
        'PLANNED', 'DESIGN', 'DEVELOPMENT', 'CODE_REVIEW', 'QA', 'COMPLETED', 'BLOCKED', 'ON_HOLD'
    )),
    owner_id VARCHAR(128) REFERENCES user_profiles(id) ON DELETE SET NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'P2' CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
    progress_percent INT DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    start_date DATE,
    deadline DATE,
    documentation_url TEXT,
    release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Features
CREATE TABLE IF NOT EXISTS features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'BACKLOG' CHECK (status IN ('BACKLOG', 'IN_PROGRESS', 'QA', 'DONE')),
    priority VARCHAR(10) NOT NULL DEFAULT 'P2' CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
    requested_by_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES features(id) ON DELETE SET NULL,
    assignee_id VARCHAR(128) REFERENCES user_profiles(id) ON DELETE SET NULL,
    reporter_id VARCHAR(128) NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    priority VARCHAR(10) NOT NULL DEFAULT 'P2' CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
    status VARCHAR(50) NOT NULL DEFAULT 'TODO' CHECK (status IN (
        'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE', 'CANCELLED'
    )),
    start_date DATE,
    due_date DATE,
    estimated_hours NUMERIC(6, 1) DEFAULT 0,
    actual_hours NUMERIC(6, 1) DEFAULT 0,
    dependencies JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. Bugs
CREATE TABLE IF NOT EXISTS bugs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bug_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. BUG-1042
    title VARCHAR(255) NOT NULL,
    description TEXT,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES features(id) ON DELETE SET NULL,
    reporter_id VARCHAR(128) NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    assigned_to_id VARCHAR(128) REFERENCES user_profiles(id) ON DELETE SET NULL,
    qa_owner_id VARCHAR(128) REFERENCES user_profiles(id) ON DELETE SET NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'MINOR' CHECK (severity IN ('CRITICAL', 'MAJOR', 'MINOR', 'COSMETIC')),
    priority VARCHAR(10) NOT NULL DEFAULT 'P2' CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
    environment VARCHAR(50) NOT NULL DEFAULT 'Production',
    app_version VARCHAR(50) NOT NULL DEFAULT 'v1.5.0',
    expected_result TEXT NOT NULL,
    actual_result TEXT NOT NULL,
    steps_to_reproduce TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'REPORTED' CHECK (status IN (
        'REPORTED', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'FIXED', 'QA_TESTING', 'CLOSED', 'REOPENED'
    )),
    attachments JSONB DEFAULT '[]'::jsonb,
    due_date DATE,
    fixed_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. Blockers
CREATE TABLE IF NOT EXISTS blockers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    person_id VARCHAR(128) NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    blocker_reason TEXT NOT NULL,
    blocked_since DATE NOT NULL,
    dependency_desc TEXT,
    owner_responsible_id VARCHAR(128) NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    expected_resolution_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 13. Daily Work Logs
CREATE TABLE IF NOT EXISTS daily_work_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(128) NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed_today TEXT NOT NULL,
    in_progress TEXT NOT NULL,
    blocked TEXT,
    tomorrow_plan TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- 14. Customer Feedback & Feature Requests (The core bridge from Gym to Product)
CREATE TABLE IF NOT EXISTS feature_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. FR-102
    gym_id UUID REFERENCES gyms(id) ON DELETE SET NULL,
    requested_by VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    business_problem TEXT NOT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'P2' CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
    customers_count INT DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'PROPOSED' CHECK (status IN (
        'PROPOSED', 'ACCEPTED', 'IN_PLANNING', 'IN_DEVELOPMENT', 'RELEASED', 'REJECTED'
    )),
    product_decision TEXT,
    module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
    target_release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 15. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(128) NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('SALES', 'DEV', 'QA', 'FOUNDER', 'TASK')),
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 16. Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(128) NOT NULL,
    action VARCHAR(100) NOT NULL,
    changed_by_id VARCHAR(128) REFERENCES user_profiles(id) ON DELETE SET NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_gyms_stage ON gyms(stage);
CREATE INDEX IF NOT EXISTS idx_gyms_assigned ON gyms(assigned_salesperson_id);
CREATE INDEX IF NOT EXISTS idx_gyms_city ON gyms(city);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_visits_salesperson ON visits(salesperson_id);
CREATE INDEX IF NOT EXISTS idx_followups_due ON follow_ups(due_date, status);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_module ON tasks(module_id);
CREATE INDEX IF NOT EXISTS idx_bugs_status ON bugs(status);
CREATE INDEX IF NOT EXISTS idx_bugs_severity ON bugs(severity);
CREATE INDEX IF NOT EXISTS idx_bugs_module ON bugs(module_id);
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
