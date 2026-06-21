import { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Tag,
  Alert,
  App,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  LoginOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { workPermitApi } from '../services/api';
import type {
  WorkPermitDetail,
  PersonnelEntry,
  PersonnelOperationRequest,
  PermitStatus,
} from '../types';

interface PersonnelSectionProps {
  permitId: string;
  detail: WorkPermitDetail;
  onRefresh: () => void;
  setActionLoading: (key: string | null) => void;
  actionLoading: string | null;
}

function PersonnelSection({
  permitId,
  detail,
  onRefresh,
  setActionLoading,
  actionLoading,
}: PersonnelSectionProps) {
  const { message } = App.useApp();
  const [entryModalVisible, setEntryModalVisible] = useState(false);
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] =
    useState<PersonnelEntry | null>(null);
  const [entryForm] = Form.useForm<PersonnelOperationRequest>();
  const [exitForm] = Form.useForm<PersonnelOperationRequest>();

  const canManagePersonnel =
    detail.permit.status === PermitStatus.IN_PROGRESS;

  const insidePersonnel = detail.personnelEntries.filter((p) => p.isInside);
  const outsidePersonnel = detail.personnelEntries.filter((p) => !p.isInside);

  const handleEntry = async (values: PersonnelOperationRequest) => {
    try {
      setActionLoading('entry');
      await workPermitApi.recordEntry(permitId, {
        ...values,
        operatorId: 'GUA001',
        operatorName: '监护人',
      });
      message.success('人员进入登记成功');
      setEntryModalVisible(false);
      entryForm.resetFields();
      onRefresh();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExit = async (values: PersonnelOperationRequest) => {
    try {
      setActionLoading('exit');
      await workPermitApi.recordExit(permitId, {
        ...values,
        personnelId: selectedPersonnel!.personnelId,
        personnelName: selectedPersonnel!.personnelName,
        operatorId: 'GUA001',
        operatorName: '监护人',
      });
      message.success('人员撤出登记成功');
      setExitModalVisible(false);
      setSelectedPersonnel(null);
      exitForm.resetFields();
      onRefresh();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const openExitModal = (personnel: PersonnelEntry) => {
    setSelectedPersonnel(personnel);
    exitForm.setFieldsValue({
      personnelId: personnel.personnelId,
      personnelName: personnel.personnelName,
    });
    setExitModalVisible(true);
  };

  const columns: ColumnsType<PersonnelEntry> = [
    {
      title: '状态',
      dataIndex: 'isInside',
      key: 'isInside',
      width: 100,
      render: (inside: boolean) =>
        inside ? (
          <Tag color="red" icon={<UserOutlined />}>
            在里面
          </Tag>
        ) : (
          <Tag color="green">已撤出</Tag>
        ),
    },
    {
      title: '姓名',
      dataIndex: 'personnelName',
      key: 'personnelName',
      width: 120,
    },
    {
      title: '工号',
      dataIndex: 'personnelId',
      key: 'personnelId',
      width: 120,
    },
    {
      title: '进入时间',
      dataIndex: 'entryTime',
      key: 'entryTime',
      width: 160,
      render: (text?: string) =>
        text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '撤出时间',
      dataIndex: 'exitTime',
      key: 'exitTime',
      width: 160,
      render: (text?: string) =>
        text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '在里面时长',
      key: 'duration',
      width: 120,
      render: (_, record) => {
        if (!record.entryTime) return '-';
        const end = record.exitTime
          ? dayjs(record.exitTime)
          : dayjs();
        const duration = end.diff(dayjs(record.entryTime), 'minute');
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        return hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;
      },
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      render: (text?: string) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) =>
        canManagePersonnel && record.isInside ? (
          <Button
            type="link"
            danger
            icon={<LogoutOutlined />}
            onClick={() => openExitModal(record)}
            loading={actionLoading === 'exit' && selectedPersonnel?.id === record.id}
          >
            登记撤出
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      {detail.insidePersonnelCount > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`当前受限空间内有 ${detail.insidePersonnelCount} 人未签出`}
          description={
            <div>
              <div>未签出人员：{detail.insidePersonnelNames?.join('、') || '暂无'}</div>
              <div style={{ marginTop: 4 }}>关闭作业票前必须确保所有人员已安全撤出</div>
            </div>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {!detail.allPersonnelExited && detail.permit.status === PermitStatus.CLOSING && (
        <Alert
          type="error"
          showIcon
          message="还有人员未撤出，不能关闭作业票"
          description="请先确认所有人员已安全撤出"
          style={{ marginBottom: 16 }}
        />
      )}

      {canManagePersonnel && (
        <Alert
          type="info"
          showIcon
          message="监护人职责"
          description="监护人必须准确记录所有进入受限空间人员的进出时间，作业结束后确认所有人员已撤出。"
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic
            title="登记人员总数"
            value={detail.personnelEntries.length}
            suffix="人"
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="在里面"
            value={insidePersonnel.length}
            suffix="人"
            valueStyle={{
              color: insidePersonnel.length > 0 ? '#cf1322' : '#3f8600',
            }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="已撤出"
            value={outsidePersonnel.length}
            suffix="人"
            valueStyle={{ color: '#3f8600' }}
          />
        </Col>
      </Row>

      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<LoginOutlined />}
          disabled={!canManagePersonnel}
          onClick={() => setEntryModalVisible(true)}
          loading={actionLoading === 'entry'}
        >
          登记进入
        </Button>
        {!canManagePersonnel && (
          <span style={{ marginLeft: 12, color: '#999' }}>
            作业开始后才能登记人员进出
          </span>
        )}
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={detail.personnelEntries}
        pagination={false}
        locale={{ emptyText: '暂无人员进出记录' }}
        rowClassName={(record) =>
          record.isInside ? 'ant-table-row-warning' : ''
        }
      />

      <Modal
        title="登记人员进入"
        open={entryModalVisible}
        onCancel={() => setEntryModalVisible(false)}
        footer={null}
        maskClosable={false}
      >
        <Form form={entryForm} layout="vertical" onFinish={handleEntry}>
          <Form.Item
            name="personnelName"
            label="人员姓名"
            rules={[{ required: true, message: '请输入人员姓名' }]}
          >
            <Input placeholder="请输入人员姓名" />
          </Form.Item>

          <Form.Item
            name="personnelId"
            label="人员工号"
            rules={[{ required: true, message: '请输入人员工号' }]}
          >
            <Input placeholder="请输入人员工号" />
          </Form.Item>

          <Form.Item name="remarks" label="备注">
            <Input.TextArea rows={2} placeholder="选填" />
          </Form.Item>

          <Alert
            type="info"
            showIcon
            message="监护人确认"
            description="请在确认人员已做好安全防护、携带好作业工具后再登记进入。"
            style={{ marginBottom: 16 }}
          />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEntryModalVisible(false)}>取消</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={actionLoading === 'entry'}
              >
                确认进入
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="登记人员撤出"
        open={exitModalVisible}
        onCancel={() => {
          setExitModalVisible(false);
          setSelectedPersonnel(null);
        }}
        footer={null}
        maskClosable={false}
      >
        <Form form={exitForm} layout="vertical" onFinish={handleExit}>
          <Form.Item label="人员姓名">
            <Input
              value={selectedPersonnel?.personnelName}
              disabled
            />
          </Form.Item>

          <Form.Item label="人员工号">
            <Input value={selectedPersonnel?.personnelId} disabled />
          </Form.Item>

          <Form.Item name="remarks" label="备注">
            <Input.TextArea rows={2} placeholder="选填" />
          </Form.Item>

          <Alert
            type="info"
            showIcon
            message="监护人确认"
            description="请确认人员已安全撤出、工具材料已全部带出。"
            style={{ marginBottom: 16 }}
          />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setExitModalVisible(false);
                  setSelectedPersonnel(null);
                }}
              >
                取消
              </Button>
              <Button
                type="primary"
                danger
                htmlType="submit"
                loading={actionLoading === 'exit'}
              >
                确认撤出
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default PersonnelSection;
