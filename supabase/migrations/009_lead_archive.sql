-- ==============================================================================
-- 009: Opportunity Pipeline Lead Archival Schema Enhancement
-- ==============================================================================

-- Optional columns to support explicit indexed boolean flags for archived leads
ALTER TABLE IF EXISTS leads ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS leads ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Index for high-performance active pipeline filtering
CREATE INDEX IF NOT EXISTS idx_leads_is_archived ON leads(is_archived);
CREATE INDEX IF NOT EXISTS idx_leads_stage_archived ON leads(stage, is_archived);
