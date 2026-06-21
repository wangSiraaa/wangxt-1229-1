export enum PermitStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  GAS_TEST_PENDING = 'GAS_TEST_PENDING',
  ISOLATION_PENDING = 'ISOLATION_PENDING',
  READY_TO_START = 'READY_TO_START',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_RESUME = 'PENDING_RESUME',
  RESUME_CONFIRMED = 'RESUME_CONFIRMED',
  CLOSING = 'CLOSING',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export enum ApprovalAction {
  SUBMIT = 'SUBMIT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  GAS_TEST_RECORD = 'GAS_TEST_RECORD',
  ISOLATION_CONFIRM = 'ISOLATION_CONFIRM',
  START_WORK = 'START_WORK',
  ENTRY_RECORD = 'ENTRY_RECORD',
  EXIT_RECORD = 'EXIT_RECORD',
  RESUME_CONFIRM = 'RESUME_CONFIRM',
  CLOSE = 'CLOSE',
  CANCEL = 'CANCEL',
}

export interface WorkPermit {
  id: string;
  permitNo: string;
  equipment: string;
  workContent: string;
  applicantId: string;
  applicantName: string;
  guardianId?: string;
  guardianName?: string;
  safetyOfficerId?: string;
  safetyOfficerName?: string;
  status: PermitStatus;
  planStartTime: string;
  planEndTime: string;
  gasExpireTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GasDetection {
  id: string;
  permitId: string;
  oxygenContent: number;
  combustibleGas: number;
  toxicGas?: number;
  detectionTime: string;
  expireTime: string;
  testerId: string;
  testerName: string;
  createdAt: string;
}

export interface IsolationPoint {
  id: string;
  permitId: string;
  location: string;
  measure: string;
  isolationTagNo?: string;
  isConfirmed: boolean;
  confirmerId?: string;
  confirmerName?: string;
  confirmTime?: string;
  createdAt: string;
}

export interface PersonnelEntry {
  id: string;
  permitId: string;
  personnelId: string;
  personnelName: string;
  entryTime?: string;
  exitTime?: string;
  isInside: boolean;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalRecord {
  id: string;
  permitId: string;
  action: ApprovalAction;
  operatorId: string;
  operatorName: string;
  comment?: string;
  fromStatus?: PermitStatus;
  toStatus?: PermitStatus;
  createdAt: string;
}

export interface WorkPermitDetail {
  permit: WorkPermit;
  gasDetections: GasDetection[];
  isolationPoints: IsolationPoint[];
  personnelEntries: PersonnelEntry[];
  approvalRecords: ApprovalRecord[];
  gasExpired: boolean;
  allIsolationConfirmed: boolean;
  allPersonnelExited: boolean;
  insidePersonnelCount: number;
  insidePersonnelNames: string[];
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CreateWorkPermitRequest {
  equipment: string;
  workContent: string;
  applicantId: string;
  applicantName: string;
  guardianId?: string;
  guardianName?: string;
  planStartTime: string;
  planEndTime: string;
}

export interface ApproveActionRequest {
  operatorId: string;
  operatorName: string;
  comment?: string;
}

export interface RecordGasDetectionRequest {
  oxygenContent: number;
  combustibleGas: number;
  toxicGas?: number;
  testerId: string;
  testerName: string;
}

export interface CreateIsolationPointRequest {
  location: string;
  measure: string;
  isolationTagNo?: string;
}

export interface PersonnelOperationRequest {
  personnelId: string;
  personnelName: string;
  remarks?: string;
  operatorId: string;
  operatorName: string;
}

export const PermitStatusText: Record<PermitStatus, string> = {
  [PermitStatus.DRAFT]: '草稿',
  [PermitStatus.PENDING_APPROVAL]: '待审批',
  [PermitStatus.GAS_TEST_PENDING]: '待气体检测',
  [PermitStatus.ISOLATION_PENDING]: '待隔离确认',
  [PermitStatus.READY_TO_START]: '准备开工',
  [PermitStatus.IN_PROGRESS]: '作业中',
  [PermitStatus.PENDING_RESUME]: '待复工确认',
  [PermitStatus.RESUME_CONFIRMED]: '复工已确认',
  [PermitStatus.CLOSING]: '关闭中',
  [PermitStatus.CLOSED]: '已关闭',
  [PermitStatus.CANCELLED]: '已取消',
};

export const PermitStatusColor: Record<PermitStatus, string> = {
  [PermitStatus.DRAFT]: 'default',
  [PermitStatus.PENDING_APPROVAL]: 'orange',
  [PermitStatus.GAS_TEST_PENDING]: 'gold',
  [PermitStatus.ISOLATION_PENDING]: 'cyan',
  [PermitStatus.READY_TO_START]: 'green',
  [PermitStatus.IN_PROGRESS]: 'processing',
  [PermitStatus.PENDING_RESUME]: 'purple',
  [PermitStatus.RESUME_CONFIRMED]: 'geekblue',
  [PermitStatus.CLOSING]: 'magenta',
  [PermitStatus.CLOSED]: 'success',
  [PermitStatus.CANCELLED]: 'error',
};

export const ApprovalActionText: Record<ApprovalAction, string> = {
  [ApprovalAction.SUBMIT]: '提交',
  [ApprovalAction.APPROVE]: '审批通过',
  [ApprovalAction.REJECT]: '驳回',
  [ApprovalAction.GAS_TEST_RECORD]: '气体检测录入',
  [ApprovalAction.ISOLATION_CONFIRM]: '隔离确认',
  [ApprovalAction.START_WORK]: '开始作业',
  [ApprovalAction.ENTRY_RECORD]: '人员进入',
  [ApprovalAction.EXIT_RECORD]: '人员撤出',
  [ApprovalAction.RESUME_CONFIRM]: '复工确认',
  [ApprovalAction.CLOSE]: '关闭',
  [ApprovalAction.CANCEL]: '取消',
};
