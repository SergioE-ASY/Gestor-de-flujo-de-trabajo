-- ============================================================
-- HGP — Herramienta de Gestión de Proyectos
-- Schema PostgreSQL — v2.0
-- ============================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Búsqueda de texto

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role         AS ENUM ('admin', 'manager', 'member', 'viewer');
CREATE TYPE project_status    AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
CREATE TYPE project_priority  AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE task_type         AS ENUM ('epic', 'story', 'task', 'bug'); -- NUEVO: Tipos de tarea
CREATE TYPE task_status       AS ENUM ('backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled');
CREATE TYPE task_priority     AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE sprint_status     AS ENUM ('planned', 'active', 'closed'); -- NUEVO: Estados del sprint
CREATE TYPE member_role       AS ENUM ('owner', 'manager', 'member', 'viewer');
CREATE TYPE notification_type AS ENUM (
  'task_assigned', 'task_updated', 'task_completed',
  'comment_added', 'mention', 'due_date_reminder',
  'project_update', 'crm_sync'
);

-- ============================================================
-- ORGANIZATIONS
-- ============================================================

CREATE TABLE organizations (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           VARCHAR(255) NOT NULL,
  crm_company_id VARCHAR(100),
  logo           BYTEA,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ -- Soft delete
);

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  role            user_role NOT NULL DEFAULT 'member',
  avatar          BYTEA,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ -- Soft delete
);

-- ============================================================
-- ORGANIZATION USERS
-- ============================================================

CREATE TABLE organization_users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            user_role NOT NULL DEFAULT 'member',
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);


-- ============================================================
-- PROJECTS
-- ============================================================

CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  key             VARCHAR(10) NOT NULL, -- NUEVO: Identificador corto (Ej. 'HGP')
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  status          project_status NOT NULL DEFAULT 'planning',
  priority        project_priority NOT NULL DEFAULT 'medium',
  start_date      DATE,
  due_date        DATE,
  crm_project_id  VARCHAR(100),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ, -- Soft delete
  UNIQUE (organization_id, key) -- La clave debe ser única por organización
);

-- ============================================================
-- PROJECT MEMBERS
-- ============================================================

CREATE TABLE project_members (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       member_role NOT NULL DEFAULT 'member',
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, user_id)
);

-- ============================================================
-- SPRINTS (NUEVO)
-- ============================================================

CREATE TABLE sprints (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL, -- Ej: 'Sprint 1', 'Sprint 2'
  goal        TEXT,
  status      sprint_status NOT NULL DEFAULT 'planned',
  start_date  TIMESTAMPTZ,
  end_date    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TASKS
-- ============================================================

CREATE TABLE tasks (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id       UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sprint_id        UUID REFERENCES sprints(id) ON DELETE SET NULL, -- NUEVO
  assignee_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  parent_task_id   UUID REFERENCES tasks(id) ON DELETE CASCADE,
  project_sequence INTEGER NOT NULL, -- NUEVO: Número incremental por proyecto (Ej: 1, 2, 3)
  type             task_type NOT NULL DEFAULT 'task', -- NUEVO
  title            VARCHAR(500) NOT NULL,
  description      TEXT,
  status           task_status NOT NULL DEFAULT 'backlog',
  priority         task_priority NOT NULL DEFAULT 'medium',
  position         INTEGER NOT NULL DEFAULT 0,
  estimated_min    INTEGER,
  due_date         DATE,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ, -- Soft delete
  UNIQUE (project_id, project_sequence)
);

-- ============================================================
-- TAGS & TASK_TAGS
-- ============================================================

CREATE TABLE tags (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  color      VARCHAR(7) NOT NULL DEFAULT '#6366f1',
  UNIQUE (project_id, name)
);

CREATE TABLE task_tags (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- ============================================================
-- COMMENTS & ATTACHMENTS & TIME LOGS & NOTIFICATIONS
-- ============================================================

CREATE TABLE comments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id    UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);

CREATE TABLE attachments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  filename    VARCHAR(500) NOT NULL,
  uploaded_photo BYTEA NOT NULL,
  file_size   INTEGER,
  mime_type   VARCHAR(100),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE time_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  minutes     INTEGER NOT NULL CHECK (minutes > 0),
  note        TEXT,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id    UUID REFERENCES tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type       notification_type NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES (Optimizados para Soft Deletes)
-- ============================================================

CREATE INDEX idx_users_email             ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_org_status     ON projects(organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_project_sprint    ON tasks(project_id, sprint_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_status            ON tasks(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_title_trgm        ON tasks USING GIN (title gin_trgm_ops);
CREATE INDEX idx_notifications_unread    ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================

-- 1. Automantener updated_at
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_upd BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tasks_upd BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_sprints_upd BEFORE UPDATE ON sprints FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 2. Marcar completed_at de forma segura (Corregido)
CREATE OR REPLACE FUNCTION set_task_completed_at() RETURNS TRIGGER AS $$BEGIN
  IF NEW.status = 'done' THEN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'done') THEN
      NEW.completed_at = NOW();
    END IF;
  ELSIF NEW.status != 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_task_completed BEFORE INSERT OR UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION set_task_completed_at();

-- 3. Autogenerar project_sequence (El número de la tarea: HGP-1, HGP-2...)
CREATE OR REPLACE FUNCTION set_task_sequence() RETURNS TRIGGER AS $$BEGIN
  SELECT COALESCE(MAX(project_sequence), 0) + 1 INTO NEW.project_sequence
  FROM tasks WHERE project_id = NEW.project_id;
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_task_sequence BEFORE INSERT ON tasks
FOR EACH ROW EXECUTE FUNCTION set_task_sequence();

-- ============================================================
-- SEEDS (Datos de prueba)
-- ============================================================

INSERT INTO organizations (id, name) VALUES ('00000000-0000-0000-0000-000000000001', 'Tech Corp');

INSERT INTO users (id, name, email, password_hash, role) VALUES
  ('00000000-0000-0000-0000-000000000010', 'Admin', 'admin@tech.com', 'hash', 'admin'),
  ('00000000-0000-0000-0000-000000000011', 'Dev', 'dev@tech.com', 'hash', 'member');

INSERT INTO organization_users (organization_id, user_id, role) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'admin'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'member');

INSERT INTO projects (id, organization_id, owner_id, key, name, status) VALUES
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'HGP', 'Herramienta de Gestión', 'active');

INSERT INTO sprints (id, project_id, name, status) VALUES
  ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000020', 'Sprint 1 - MVP', 'active');

-- Nota: No insertamos "project_sequence", el trigger lo calculará automáticamente.
INSERT INTO tasks (project_id, sprint_id, assignee_id, type, title, status) VALUES
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000010', 'epic', 'Crear Base de Datos', 'done'),
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000011', 'story', 'Implementar Auth JWT', 'in_progress');