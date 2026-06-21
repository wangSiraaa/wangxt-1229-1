import { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Space,
  Tag,
  Alert,
  App,
  Row,
  Col,
  Statistic,
} from 'antd';
import { PlusOutlined, SafetyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { workPermitApi } from '../services/api';
import type {
  WorkPermitDetail,
  GasDetection,
  RecordGasDetectionRequest,
  PermitStatus,
} from '../types';

interface GasDetectionSectionProps {
  permitId: string;
  detail: WorkPermitDetail;
  onRefresh: () => void;
  setActionLoading: (key: string | null) => void;
  actionLoading: string | null;
}

function GasDetectionSection({
  permitId,
  detail,
  onRefresh,
  setActionLoading,
  actionLoading,
}: GasDetectionSectionProps) {
  const { message } = App.useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm<RecordGasDetectionRequest>();

  const canRecordGas =
    detail.permit.status === PermitStatus.GAS_TEST_PENDING ||
    (detail.permit.status === PermitStatus.PENDING_RESUME && detail.gasExpired) ||
    (detail.permit.status === PermitStatus.IN_PROGRESS && detail.gasExpired);

  const handleRecordGas = async (values: RecordGasDetectionRequest) => {
    try {
      setActionLoading('gas');
      await workPermitApi.recordGasDetection(permitId, {
        ...values,
        testerId: 'SAF001',
        testerName: '安全员',
      });
      message.success('气体检测记录成功');
      setModalVisible(false);
      form.resetFields();
      onRefresh();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const columns: ColumnsType<GasDetection> = [
    {
      title: '检测时间',
      dataIndex: 'detectionTime',
      key: 'detectionTime',
      width: 180,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '氧含量 (%)',
      dataIndex: 'oxygenContent',
      key: 'oxygenContent',
      width: 120,
      render: (value: number) => {
        const isNormal = value >= 19.5 && value <= 23.5;
        return (
          <Tag color={isNormal ? 'green' : 'red'}>
            {value.toFixed(2)}%
          </Tag>
        );
      },
    },
    {
      title: '可燃气体 (%LEL)',
      dataIndex: 'combustibleGas',
      key: 'combustibleGas',
      width: 140,
      render: (value: number) => {
        const isNormal = value < 10;
        return (
          <Tag color={isNormal ? 'green' : 'red'}>
            {value.toFixed(2)}%
          </Tag>
        );
      },
    },
    {
      title: '有毒气体 (ppm)',
      dataIndex: 'toxicGas',
      key: 'toxicGas',
      width: 130,
      render: (value?: number) =>
        value !== undefined ? `${value.toFixed(2)}` : '-',
    },
    {
      title: '有效期至',
      dataIndex: 'expireTime',
      key: 'expireTime',
      width: 180,
      render: (text: string) => {
        const isExpired = dayjs().isAfter(text);
        return (
          <Space>
            {dayjs(text).format('YYYY-MM-DD HH:mm')}
            <Tag color={isExpired ? 'red' : 'green'}>
              {isExpired ? '已过期' : '有效'}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: '检测人',
      dataIndex: 'testerName',
      key: 'testerName',
      width: 100,
    },
  ];

  const latestDetection = detail.gasDetections[0];

  return (
    <div>
      {detail.gasExpired && (
        <Alert
          type="warning"
          showIcon
          message="气体检测已过期"
          description="请重新进行气体检测后再继续作业"
          style={{ marginBottom: 16 }}
        />
      )}

      {latestDetection && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Statistic
              title="最新氧含量"
              value={latestDetection.oxygenContent}
              suffix="%"
              prefix={<SafetyOutlined />}
              valueStyle={{
                color:
                  latestDetection.oxygenContent >= 19.5 &&
                  latestDetection.oxygenContent <= 23.5
                    ? '#3f8600'
                    : '#cf1322',
              }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="最新可燃气体"
              value={latestDetection.combustibleGas}
              suffix="%LEL"
              valueStyle={{
                color: latestDetection.combustibleGas < 10 ? '#3f8600' : '#cf1322',
              }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="检测次数"
              value={detail.gasDetections.length}
              suffix="次"
            />
          </Col>
        </Row>
      )}

      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          disabled={!canRecordGas}
          onClick={() => setModalVisible(true)}
          loading={actionLoading === 'gas'}
        >
          录入气体检测
        </Button>
        {!canRecordGas && detail.permit.status !== PermitStatus.DRAFT && (
          <span style={{ marginLeft: 12, color: '#999' }}>
            当前状态无需气体检测
          </span>
        )}
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={detail.gasDetections}
        pagination={false}
        locale={{ emptyText: '暂无气体检测记录' }}
      />

      <Modal
        title="录入气体检测数据"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRecordGas}
          initialValues={{
            oxygenContent: 20.8,
            combustibleGas: 0,
            toxicGas: 0,
          }}
        >
          <Form.Item
            name="oxygenContent"
            label="氧含量 (%)"
            rules={[
              { required: true, message: '请输入氧含量' },
              {
                type: 'number',
                min: 19.5,
                max: 23.5,
                message: '氧含量必须在19.5%-23.5%之间',
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              step={0.1}
              precision={2}
              placeholder="请输入氧含量"
            />
          </Form.Item>

          <Form.Item
            name="combustibleGas"
            label="可燃气体 (%LEL)"
            rules={[
              { required: true, message: '请输入可燃气体含量' },
              {
                type: 'number',
                min: 0,
                max: 100,
                message: '可燃气体含量必须在0-100%之间',
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              step={0.1}
              precision={2}
              placeholder="请输入可燃气体含量"
            />
          </Form.Item>

          <Form.Item
            name="toxicGas"
            label="有毒气体 (ppm)"
            rules={[
              {
                type: 'number',
                min: 0,
                message: '有毒气体含量不能为负数',
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              step={0.1}
              precision={2}
              placeholder="请输入有毒气体含量（选填）"
            />
          </Form.Item>

          <Alert
            type="info"
            showIcon
            message="检测标准"
            description="氧含量: 19.5%-23.5%为合格；可燃气体: ＜10%LEL为合格"
            style={{ marginBottom: 16 }}
          />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={actionLoading === 'gas'}
              >
                确认录入
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default GasDetectionSection;
