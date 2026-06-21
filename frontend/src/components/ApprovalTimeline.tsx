import { Timeline, Tag } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SafetyOutlined,
  UnlockOutlined,
  LoginOutlined,
  LogoutOutlined,
  PlayCircleOutlined,
  StopOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ApprovalRecord, ApprovalAction, PermitStatus } from '../types';
import {
  ApprovalActionText,
  PermitStatusText,
  PermitStatusColor,
} from '../types';

interface ApprovalTimelineProps {
  records: ApprovalRecord[];
}

const actionIcons: Record<ApprovalAction, React.ReactNode> = {
  SUBMIT: <ArrowUpOutlined />,
  APPROVE: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  REJECT: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
  GAS_TEST_RECORD: <SafetyOutlined style={{ color: '#13c2c2' }} />,
  ISOLATION_CONFIRM: <UnlockOutlined style={{ color: '#fa8c16' }} />,
  START_WORK: <PlayCircleOutlined style={{ color: '#1890ff' }} />,
  ENTRY_RECORD: <LoginOutlined style={{ color: '#722ed1' }} />,
  EXIT_RECORD: <LogoutOutlined style={{ color: '#722ed1' }} />,
  RESUME_CONFIRM: <PlayCircleOutlined style={{ color: '#eb2f96' }} />,
  CLOSE: <StopOutlined style={{ color: '#ff4d4f' }} />,
  CANCEL: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
};

const actionColors: Record<ApprovalAction, string> = {
  SUBMIT: 'blue',
  APPROVE: 'green',
  REJECT: 'red',
  GAS_TEST_RECORD: 'cyan',
  ISOLATION_CONFIRM: 'orange',
  START_WORK: 'blue',
  ENTRY_RECORD: 'purple',
  EXIT_RECORD: 'purple',
  RESUME_CONFIRM: 'magenta',
  CLOSE: 'red',
  CANCEL: 'red',
};

function ApprovalTimeline({ records }: ApprovalTimelineProps) {
  if (records.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '40px',
          color: '#999',
        }}
      >
        <ClockCircleOutlined style={{ fontSize: '48px', marginBottom: 16 }} />
        <p>暂无审批记录</p>
      </div>
    );
  }

  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div style={{ padding: '24px 0' }}>
      <Timeline
        mode="left"
        items={sortedRecords.map((record, index) => ({
          color: actionColors[record.action],
          dot: actionIcons[record.action],
          label: (
            <div style={{ minWidth: 180 }}>
              <div style={{ fontWeight: 500 }}>
                {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </div>
              <div style={{ color: '#999', fontSize: 12 }}>
                {record.operatorName} ({record.operatorId})
              </div>
            </div>
          ),
          children: (
            <div>
              <div style={{ marginBottom: 8 }}>
                <Tag color={actionColors[record.action]}>
                  {ApprovalActionText[record.action]}
                </Tag>
              </div>
              {record.fromStatus && record.toStatus && (
                <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                  状态变更:
                  <Tag color={PermitStatusColor[record.fromStatus as PermitStatus]}>
                    {PermitStatusText[record.fromStatus as PermitStatus]}
                  </Tag>
                  <span style={{ margin: '0 8px' }}>→</span>
                  <Tag color={PermitStatusColor[record.toStatus as PermitStatus]}>
                    {PermitStatusText[record.toStatus as PermitStatus]}
                  </Tag>
                </div>
              )}
              {record.comment && (
                <div style={{ fontSize: 13, color: '#666' }}>
                  备注: {record.comment}
                </div>
              )}
            </div>
          ),
          position: index % 2 === 0 ? 'left' : 'right',
        }))}
      />
    </div>
  );
}

export default ApprovalTimeline;
