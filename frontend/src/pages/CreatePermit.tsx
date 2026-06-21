import { useState } from 'react';
import {
  Card,
  Form,
  Input,
  DatePicker,
  Button,
  Space,
  Row,
  Col,
  App,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { workPermitApi } from '../services/api';
import type { CreateWorkPermitRequest } from '../types';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface CreateFormValues {
  equipment: string;
  workContent: string;
  applicantId: string;
  applicantName: string;
  guardianId?: string;
  guardianName?: string;
  planTimeRange?: [Dayjs, Dayjs];
}

function CreatePermit() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm<CreateFormValues>();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: CreateFormValues) => {
    try {
      setLoading(true);
      const requestData: CreateWorkPermitRequest = {
        equipment: values.equipment,
        workContent: values.workContent,
        applicantId: values.applicantId,
        applicantName: values.applicantName,
        guardianId: values.guardianId,
        guardianName: values.guardianName,
        planStartTime: values.planTimeRange
          ? values.planTimeRange[0].format('YYYY-MM-DD HH:mm:ss')
          : '',
        planEndTime: values.planTimeRange
          ? values.planTimeRange[1].format('YYYY-MM-DD HH:mm:ss')
          : '',
      };
      const result = await workPermitApi.createPermit(requestData);
      message.success('作业票创建成功');
      navigate(`/permit/${result.id}`);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="新建作业票"
      extra={
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
          返回列表
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          applicantId: 'APP001',
          applicantName: '张三',
          planTimeRange: [dayjs(), dayjs().add(8, 'hour')],
        }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="equipment"
              label="设备名称"
              rules={[{ required: true, message: '请输入设备名称' }]}
            >
              <Input placeholder="请输入设备名称" size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="planTimeRange"
              label="计划作业时间"
              rules={[{ required: true, message: '请选择作业时间' }]}
            >
              <RangePicker
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                style={{ width: '100%' }}
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="workContent"
          label="作业内容"
          rules={[{ required: true, message: '请输入作业内容' }]}
        >
          <TextArea
            rows={4}
            placeholder="请详细描述作业内容，包括作业范围、作业方式等"
            size="large"
          />
        </Form.Item>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="applicantName"
              label="申请人姓名"
              rules={[{ required: true, message: '请输入申请人姓名' }]}
            >
              <Input placeholder="请输入申请人姓名" size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="applicantId"
              label="申请人工号"
              rules={[{ required: true, message: '请输入申请人工号' }]}
            >
              <Input placeholder="请输入申请人工号" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item name="guardianName" label="监护人姓名">
              <Input placeholder="请输入监护人姓名" size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="guardianId" label="监护人工号">
              <Input placeholder="请输入监护人工号" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              loading={loading}
            >
              创建作业票
            </Button>
            <Button size="large" onClick={() => navigate('/')}>
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default CreatePermit;
