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
  Checkbox,
} from 'antd';
import {
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { workPermitApi } from '../services/api';
import type {
  WorkPermitDetail,
  IsolationPoint,
  CreateIsolationPointRequest,
  ApproveActionRequest,
  PermitStatus,
} from '../types';

interface IsolationSectionProps {
  permitId: string;
  detail: WorkPermitDetail;
  onRefresh: () => void;
  setActionLoading: (key: string | null) => void;
  actionLoading: string | null;
}

function IsolationSection({
  permitId,
  detail,
  onRefresh,
  setActionLoading,
  actionLoading,
}: IsolationSectionProps) {
  const { message, modal } = App.useApp();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addForm] = Form.useForm<CreateIsolationPointRequest>();

  const canAddIsolation =
    detail.permit.status === PermitStatus.DRAFT ||
    detail.permit.status === PermitStatus.GAS_TEST_PENDING ||
    detail.permit.status === PermitStatus.ISOLATION_PENDING;

  const canConfirmIsolation =
    detail.permit.status === PermitStatus.ISOLATION_PENDING;

  const confirmedCount = detail.isolationPoints.filter(
    (p) => p.isConfirmed
  ).length;
  const unconfirmedCount = detail.isolationPoints.length - confirmedCount;

  const handleAddIsolation = async (values: CreateIsolationPointRequest) => {
    try {
      setActionLoading('addIsolation');
      await workPermitApi.addIsolationPoint(permitId, values);
      message.success('隔离点添加成功');
      setAddModalVisible(false);
      addForm.resetFields();
      onRefresh();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmIsolation = (point: IsolationPoint) => {
    if (point.isConfirmed) {
      message.info('该隔离点已确认');
      return;
    }

    modal.confirm({
      title: '确认隔离点',
      content: (
        <div>
          <p>
            <strong>位置:</strong> {point.location}
          </p>
          <p>
            <strong>隔离措施:</strong> {point.measure}
          </p>
          {point.isolationTagNo && (
            <p>
              <strong>隔离标签:</strong> {point.isolationTagNo}
            </p>
          )}
        </div>
      ),
      okText: '确认已隔离',
      cancelText: '取消',
      onOk: async () => {
        try {
          setActionLoading(`confirm-${point.id}`);
          await workPermitApi.confirmIsolationPoint(permitId, point.id, {
            operatorId: 'WRK001',
            operatorName: '作业负责人',
          });
          message.success('隔离点确认成功');
          onRefresh();
        } catch (error) {
          message.error((error as Error).message);
          throw error;
        } finally {
          setActionLoading(null);
        }
      },
      confirmLoading: actionLoading === `confirm-${point.id}`,
    });
  };

  const columns: ColumnsType<IsolationPoint> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '隔离位置',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '隔离措施',
      dataIndex: 'measure',
      key: 'measure',
    },
    {
      title: '隔离标签号',
      dataIndex: 'isolationTagNo',
      key: 'isolationTagNo',
      width: 120,
      render: (text?: string) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'isConfirmed',
      key: 'isConfirmed',
      width: 100,
      render: (confirmed: boolean) =>
        confirmed ? (
          <Tag icon={<CheckCircleOutlined />} color="green">
            已确认
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="orange">
            待确认
          </Tag>
        ),
    },
    {
      title: '确认人',
      dataIndex: 'confirmerName',
      key: 'confirmerName',
      width: 100,
      render: (text?: string) => text || '-',
    },
    {
      title: '确认时间',
      dataIndex: 'confirmTime',
      key: 'confirmTime',
      width: 160,
      render: (text?: string) =>
        text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) =>
        canConfirmIsolation && !record.isConfirmed ? (
          <Button
            type="link"
            onClick={() => handleConfirmIsolation(record)}
            loading={actionLoading === `confirm-${record.id}`}
          >
            确认
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      {!detail.allIsolationConfirmed &&
        detail.isolationPoints.length > 0 &&
        detail.permit.status !== PermitStatus.DRAFT && (
          <Alert
            type="warning"
            showIcon
            message={`还有 ${unconfirmedCount} 个隔离点未确认`}
            description="请确认所有隔离点后才能进入作业"
            style={{ marginBottom: 16 }}
          />
        )}

      {detail.isolationPoints.length > 0 && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Statistic
              title="隔离点总数"
              value={detail.isolationPoints.length}
              suffix="个"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="已确认"
              value={confirmedCount}
              suffix="个"
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="待确认"
              value={unconfirmedCount}
              suffix="个"
              valueStyle={{ color: unconfirmedCount > 0 ? '#cf1322' : '#3f8600' }}
            />
          </Col>
        </Row>
      )}

      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          disabled={!canAddIsolation}
          onClick={() => setAddModalVisible(true)}
          loading={actionLoading === 'addIsolation'}
        >
          添加隔离点
        </Button>
        {!canAddIsolation && (
          <span style={{ marginLeft: 12, color: '#999' }}>
            当前状态无法添加隔离点
          </span>
        )}
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={detail.isolationPoints}
        pagination={false}
        locale={{ emptyText: '暂无隔离点记录' }}
      />

      <Modal
        title="添加能量隔离点"
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
        maskClosable={false}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddIsolation}
        >
          <Form.Item
            name="location"
            label="隔离位置"
            rules={[{ required: true, message: '请输入隔离位置' }]}
          >
            <Input placeholder="例如：阀门A-101入口" />
          </Form.Item>

          <Form.Item
            name="measure"
            label="隔离措施"
            rules={[{ required: true, message: '请输入隔离措施' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="例如：关闭阀门并上锁挂牌"
            />
          </Form.Item>

          <Form.Item name="isolationTagNo" label="隔离标签号">
            <Input placeholder="例如：LOCK-001（选填）" />
          </Form.Item>

          <Alert
            type="info"
            showIcon
            message="注意事项"
            description="能量隔离包括：切断电源、关闭阀门、锁定开关、释放压力等措施，确保作业区域安全。"
            style={{ marginBottom: 16 }}
          />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setAddModalVisible(false)}>取消</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={actionLoading === 'addIsolation'}
              >
                添加
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default IsolationSection;
