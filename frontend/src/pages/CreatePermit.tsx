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
import dayjs from 'dayjs';
import { workPermitApi } from '../services/api';
import type { CreateWorkPermitRequest } from '../types';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

function CreatePermit() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm<CreateWorkPermitRequest>();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: CreateWorkPermitRequest) => {
    try {
      setLoading(true);
      const result = await workPermitApi.createPermit(values);
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
          planStartTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          planEndTime: dayjs().add(8, 'hour').format('YYYY-MM-DD HH:mm:ss'),
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
              name={['planStartTime', 'planEndTime']}
              label="计划作业时间"
              rules={[{ required: true, message: '请选择作业时间' }]}
              getValueFromEvent={(dates) => {
                if (dates && dates.length === 2) {
                  return {
                    planStartTime: dates[0].format('YYYY-MM-DD HH:mm:ss'),
                    planEndTime: dates[1].format('YYYY-MM-DD HH:mm:ss'),
                  };
                }
                return null;
              }}
              getValueProps={(value) => {
                if (value && value.planStartTime && value.planEndTime) {
                  return {
                    value: [
                      dayjs(value.planStartTime),
                      dayjs(value.planEndTime),
                    ],
                  };
                }
                return { value: undefined };
              }}
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
