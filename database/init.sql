-- 化工厂受限空间作业票系统数据库

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 作业票状态枚举
CREATE TYPE permit_status AS ENUM (
    'DRAFT',
    'PENDING_APPROVAL',
    'GAS_TEST_PENDING',
    'ISOLATION_PENDING',
    'READY_TO_START',
    'IN_PROGRESS',
    'PENDING_RESUME',
    'RESUME_CONFIRMED',
    'CLOSING',
    'CLOSED',
    'CANCELLED'
);

-- 审批动作枚举
CREATE TYPE approval_action AS ENUM (
    'SUBMIT',
    'APPROVE',
    'REJECT',
    'GAS_TEST_RECORD',
    'ISOLATION_CONFIRM',
    'START_WORK',
    'ENTRY_RECORD',
    'EXIT_RECORD',
    'RESUME_CONFIRM',
    'CLOSE',
    'CANCEL'
);

-- 作业票主表
CREATE TABLE work_permit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permit_no VARCHAR(50) UNIQUE NOT NULL,
    equipment VARCHAR(200) NOT NULL,
    work_content TEXT NOT NULL,
    applicant_id VARCHAR(50) NOT NULL,
    applicant_name VARCHAR(100) NOT NULL,
    guardian_id VARCHAR(50),
    guardian_name VARCHAR(100),
    safety_officer_id VARCHAR(50),
    safety_officer_name VARCHAR(100),
    status permit_status NOT NULL DEFAULT 'DRAFT',
    plan_start_time TIMESTAMP,
    plan_end_time TIMESTAMP,
    gas_expire_time TIMESTAMP,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_work_permit_status ON work_permit(status);
CREATE INDEX idx_work_permit_applicant ON work_permit(applicant_id);
CREATE INDEX idx_work_permit_guardian ON work_permit(guardian_id);

-- 气体检测表
CREATE TABLE gas_detection (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permit_id UUID NOT NULL REFERENCES work_permit(id) ON DELETE CASCADE,
    oxygen_content DECIMAL(5,2) NOT NULL,
    combustible_gas DECIMAL(8,4) NOT NULL,
    toxic_gas DECIMAL(8,4),
    detection_time TIMESTAMP NOT NULL,
    expire_time TIMESTAMP NOT NULL,
    tester_id VARCHAR(50) NOT NULL,
    tester_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gas_detection_permit ON gas_detection(permit_id);

-- 能量隔离点表
CREATE TABLE isolation_point (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permit_id UUID NOT NULL REFERENCES work_permit(id) ON DELETE CASCADE,
    location VARCHAR(200) NOT NULL,
    measure VARCHAR(500) NOT NULL,
    isolation_tag_no VARCHAR(50),
    is_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    confirmer_id VARCHAR(50),
    confirmer_name VARCHAR(100),
    confirm_time TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_isolation_point_permit ON isolation_point(permit_id);

-- 人员进出记录表
CREATE TABLE personnel_entry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permit_id UUID NOT NULL REFERENCES work_permit(id) ON DELETE CASCADE,
    personnel_id VARCHAR(50) NOT NULL,
    personnel_name VARCHAR(100) NOT NULL,
    entry_time TIMESTAMP,
    exit_time TIMESTAMP,
    is_inside BOOLEAN NOT NULL DEFAULT FALSE,
    remarks TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(permit_id, personnel_id)
);

CREATE INDEX idx_personnel_entry_permit ON personnel_entry(permit_id);
CREATE INDEX idx_personnel_entry_inside ON personnel_entry(is_inside);

-- 审批记录表
CREATE TABLE approval_record (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permit_id UUID NOT NULL REFERENCES work_permit(id) ON DELETE CASCADE,
    action approval_action NOT NULL,
    operator_id VARCHAR(50) NOT NULL,
    operator_name VARCHAR(100) NOT NULL,
    comment TEXT,
    from_status permit_status,
    to_status permit_status,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_approval_record_permit ON approval_record(permit_id);

-- 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_work_permit_updated_at
    BEFORE UPDATE ON work_permit
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personnel_entry_updated_at
    BEFORE UPDATE ON personnel_entry
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
