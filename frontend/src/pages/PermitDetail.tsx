import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Row,
  Col,
  Button,
  Space,
  Divider,
  Tabs,
  Alert,
  App,
  Modal,
  Form,
  Input,
  Badge,
} from 'antd';
import {
  useParams,
  useNavigate,
} from 'react-router-dom';
import dayjs from 'dayjs';
import {
  PlayCircleOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { workPermitApi } from '../services/api';
import {
  WorkPermitDetail,
  PermitStatus,
  ApproveActionRequest,
  PermitStatusText,
  PermitStatusColor,
} from '../types';
import GasDetectionSection from '../components/GasDetectionSection';
import IsolationSection from '../components/IsolationSection';
import PersonnelSection from '../components/PersonnelSection';
import ApprovalTimeline from '../components/ApprovalTimeline';

const { TabPane } = Tabs;
const { TextArea } = Input;

function PermitDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const [detail, setDetail] = useState<WorkPermitDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [commentForm] = Form.useForm();

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await workPermitApi.getPermitDetail(id);
      setDetail(data);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id, message]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const showActionModal = (
    title: string,
    action: () => Promise<void>,
    loadingKey: string
  ) => {
    commentForm.resetFields();
    Modal.confirm({
      title,
      content: (
        <Form form={commentForm} layout="vertical">
          <Form.Item name="comment" label="备注">
            <TextArea rows={3} placeholder="请输入备注信息（选填）" />
          </Form.Item>
        </Form>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await commentForm.validateFields();
          setActionLoading(loadingKey);
          await action();
          message.success('操作成功');
          fetchDetail();
        } catch (error) {
          message.error((error as Error).message);
          throw error;
        } finally {
          setActionLoading(null);
        }
      },
      confirmLoading: actionLoading === loadingKey,
    });
  };

  const handleSubmit = () => {
    showActionModal(
      '确认提交作业票？',
      async () => {
        const values = commentForm.getFieldsValue();
        await workPermitApi.submitPermit(id!, {
          operatorId: 'OPR001',
          operatorName: '系统管理员',
          ...values,
        });
      },
      'submit'
    );
  };

  const handleApprove = () => {
    showActionModal(
      '确认审批通过？',
      async () => {
        const values = commentForm.getFieldsValue();
        await workPermitApi.approvePermit(id!, {
          operatorId: 'MGR001',
          operatorName: '审批人',
          ...values,
        });
      },
      'approve'
    );
  };

  const handleReject = () => {
    showActionModal(
      '确认驳回作业票？',
      async () => {
        const values = commentForm.getFieldsValue();
        await workPermitApi.rejectPermit(id!, {
          operatorId: 'MGR001',
          operatorName: '审批人',
          comment: values.comment || '驳回',
        });
      },
      'reject'
    );
  };

  const handleStartWork = () => {
    if (detail?.gasExpired) {
      message.error('气体检测已过期，请重新检测');
      return;
    }
    if (!detail?.allIsolationConfirmed) {
      message.error('能量隔离未全部确认，无法开工');
      return;
    }
    showActionModal(
      '确认开始作业？',
      async () => {
        const values = commentForm.getFieldsValue();
        await workPermitApi.startWork(id!, {
          operatorId: 'WRK001',
          operatorName: '作业负责人',
          ...values,
        });
      },
      'start'
    );
  };

  const handleConfirmResume = () => {
    if (detail?.gasExpired) {
      message.error('气体检测已过期，请重新检测');
      return;
    }
    showActionModal(
      '确认复工？',
      async () => {
        const values = commentForm.getFieldsValue();
        await workPermitApi.confirmResume(id!, {
          operatorId: 'WRK001',
          operatorName: '作业负责人',
          ...values,
        });
      },
      'resume'
    );
  };

  const handleClose = () => {
    if (detail?.insidePersonnelCount > 0 && detail.insidePersonnelNames?.length > 0) {
      Modal.confirm({
        title: '无法关闭作业票',
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
        content: (
          <div>
            <p style={{ marginBottom: 8 }}>
              还有 <strong style={{ color: '#ff4d4f' }}>{detail.insidePersonnelCount}</strong> 名人员未签出，不能关闭作业票：
            </p>
            <div style={{
              padding: '12px 16px',
              background: '#fff2f0',
              borderRadius: 6,
              border: '1px solid #ffccc7',
            }}>
              {detail.insidePersonnelNames.map((name, index) => (
                <Tag key={index} color="red" style={{ marginBottom: 4 }}>
                  {name}
                </Tag>
              ))}
            </div>
          </div>
        ),
        okText: '我知道了',
        cancelButtonProps: { style: { display: 'none' } },
      });
      return;
    }
    showActionModal(
      '确认关闭作业票？',
      async () => {
        const values = commentForm.getFieldsValue();
        await workPermitApi.closePermit(id!, {
          operatorId: 'MGR001',
          operatorName: '审批人',
          ...values,
        });
      },
      'close'
    );
  };

  const handleCancel = () => {
    showActionModal(
      '确认取消作业票？',
      async () => {
        const values = commentForm.getFieldsValue();
        await workPermitApi.cancelPermit(id!, {
          operatorId: 'MGR001',
          operatorName: '审批人',
          comment: values.comment || '取消',
        });
      },
      'cancel'
    );
  };

  const renderActionButtons = () => {
    if (!detail) return null;
    const { status } = detail.permit;

    const buttons: React.ReactNode[] = [];

    if (status === PermitStatus.DRAFT) {
      buttons.push(
        <Button
          key="submit"
          type="primary"
          icon={<ArrowUpOutlined />}
          onClick={handleSubmit}
          loading={actionLoading === 'submit'}
        >
          提交审批
        </Button>
      );
      buttons.push(
        <Button
          key="cancel"
          danger
          onClick={handleCancel}
          loading={actionLoading === 'cancel'}
        >
          取消作业票
        </Button>
      );
    }

    if (status === PermitStatus.PENDING_APPROVAL) {
      buttons.push(
        <Button
          key="approve"
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={handleApprove}
          loading={actionLoading === 'approve'}
        >
          审批通过
        </Button>
      );
      buttons.push(
        <Button
          key="reject"
          danger
          onClick={handleReject}
          loading={actionLoading === 'reject'}
        >
          驳回
        </Button>
      );
      buttons.push(
        <Button
          key="cancel"
          onClick={handleCancel}
          loading={actionLoading === 'cancel'}
        >
          取消作业票
        </Button>
      );
    }

    if (status === PermitStatus.READY_TO_START || status === PermitStatus.RESUME_CONFIRMED) {
      buttons.push(
        <Button
          key="start"
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={handleStartWork}
          loading={actionLoading === 'start'}
        >
          开始作业
        </Button>
      );
    }

    if (status === PermitStatus.PENDING_RESUME) {
      buttons.push(
        <Button
          key="resume"
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={handleConfirmResume}
          loading={actionLoading === 'resume'}
        >
          确认复工
        </Button>
      );
    }

    if (status === PermitStatus.IN_PROGRESS || status === PermitStatus.RESUME_CONFIRMED) {
      buttons.push(
        <Button
          key="close"
          type="primary"
          danger
          icon={<StopOutlined />}
          onClick={handleClose}
          loading={actionLoading === 'close'}
        >
          关闭作业票
        </Button>
      );
    }

    return buttons.length > 0 ? (
      <Space wrap>{buttons}</Space>
    ) : (
      <span style={{ color: '#999' }}>当前状态无可用操作</span>
    );
  };

  const renderAlerts = () => {
    if (!detail) return null;
    const alerts = [];

    if (detail.gasExpired) {
      alerts.push(
        <Alert
          key="gas"
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message="气体检测已过期"
          description="需要重新进行气体检测才能继续作业"
          style={{ marginBottom: 16 }}
        />
      );
    }

    if (!detail.allIsolationConfirmed && detail.permit.status !== PermitStatus.DRAFT) {
      alerts.push(
        <Alert
          key="isolation"
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message="能量隔离未全部确认"
          description="请确认所有隔离点后才能进入作业"
          style={{ marginBottom: 16 }}
        />
      );
    }

    if (detail.insidePersonnelCount > 0) {
      alerts.push(
        <Alert
          key="personnel"
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message={`当前受限空间内有 ${detail.insidePersonnelCount} 人`}
          description={
            <div>
              <div>未签出人员：{detail.insidePersonnelNames?.join('、') || '暂无'}</div>
              <div style={{ marginTop: 4 }}>关闭作业票前必须确保所有人员已撤出</div>
            </div>
          }
          style={{ marginBottom: 16 }}
        />
      );
    }

    return alerts;
  };

  if (!detail) {
    return <Card loading={loading} />;
  }

  const { permit } = detail;

  return (
    <div>
      {renderAlerts()}

      <Card
        loading={loading}
        title={
          <Space>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
              作业票: {permit.permitNo}
            </span>
            <Tag color={PermitStatusColor[permit.status]}>
              {PermitStatusText[permit.status]}
            </Tag>
          </Space>
        }
        extra={renderActionButtons()}
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="设备">{permit.equipment}</Descriptions.Item>
          <Descriptions.Item label="申请人">
            {permit.applicantName} ({permit.applicantId})
          </Descriptions.Item>
          <Descriptions.Item label="监护人">
            {permit.guardianName
              ? `${permit.guardianName} (${permit.guardianId})`
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="安全员">
            {permit.safetyOfficerName
              ? `${permit.safetyOfficerName} (${permit.safetyOfficerId})`
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="计划开始时间">
            {dayjs(permit.planStartTime).format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="计划结束时间">
            {dayjs(permit.planEndTime).format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="实际开始时间">
            {permit.actualStartTime
              ? dayjs(permit.actualStartTime).format('YYYY-MM-DD HH:mm')
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="实际结束时间">
            {permit.actualEndTime
              ? dayjs(permit.actualEndTime).format('YYYY-MM-DD HH:mm')
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="气体检测有效期" span={2}>
            {permit.gasExpireTime ? (
              <Space>
                {dayjs(permit.gasExpireTime).format('YYYY-MM-DD HH:mm')}
                {detail.gasExpired ? (
                  <Tag color="red">已过期</Tag>
                ) : (
                  <Tag color="green">有效</Tag>
                )}
              </Space>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="作业内容" span={2}>
            {permit.workContent}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card>
        <Tabs defaultActiveKey="1">
          <TabPane tab="气体检测" key="1">
            <GasDetectionSection
              permitId={id!}
              detail={detail}
              onRefresh={fetchDetail}
              setActionLoading={setActionLoading}
              actionLoading={actionLoading}
            />
          </TabPane>
          <TabPane tab="能量隔离" key="2">
            <IsolationSection
              permitId={id!}
              detail={detail}
              onRefresh={fetchDetail}
              setActionLoading={setActionLoading}
              actionLoading={actionLoading}
            />
          </TabPane>
          <TabPane
            tab={
              <Space>
                人员进出
                {detail.insidePersonnelCount > 0 && (
                  <Badge count={detail.insidePersonnelCount} color="red" />
                )}
              </Space>
            }
            key="3"
          >
            <PersonnelSection
              permitId={id!}
              detail={detail}
              onRefresh={fetchDetail}
              setActionLoading={setActionLoading}
              actionLoading={actionLoading}
            />
          </TabPane>
          <TabPane tab="审批记录" key="4">
            <ApprovalTimeline records={detail.approvalRecords} />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}

export default PermitDetail;
