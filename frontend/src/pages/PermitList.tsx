import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Select,
  Card,
  Input,
  App,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { workPermitApi } from '../services/api';
import type { WorkPermit, PermitStatus } from '../types';
import { PermitStatusText, PermitStatusColor } from '../types';

const { Search } = Input;
const { Option } = Select;

function PermitList() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WorkPermit[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<PermitStatus[] | undefined>();
  const [searchText, setSearchText] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await workPermitApi.listPermits({
        page: page - 1,
        size: pageSize,
        statuses: statusFilter,
      });
      setData(result.content);
      setTotal(result.totalElements);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, statusFilter]);

  const filteredData = searchText
    ? data.filter(
        (item) =>
          item.permitNo.toLowerCase().includes(searchText.toLowerCase()) ||
          item.equipment.toLowerCase().includes(searchText.toLowerCase()) ||
          item.applicantName.includes(searchText)
      )
    : data;

  const columns: ColumnsType<WorkPermit> = [
    {
      title: '作业票编号',
      dataIndex: 'permitNo',
      key: 'permitNo',
      width: 180,
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '设备',
      dataIndex: 'equipment',
      key: 'equipment',
      ellipsis: true,
    },
    {
      title: '作业内容',
      dataIndex: 'workContent',
      key: 'workContent',
      ellipsis: true,
    },
    {
      title: '申请人',
      dataIndex: 'applicantName',
      key: 'applicantName',
      width: 100,
    },
    {
      title: '监护人',
      dataIndex: 'guardianName',
      key: 'guardianName',
      width: 100,
      render: (text?: string) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: PermitStatus) => (
        <Tag color={PermitStatusColor[status]}>
          {PermitStatusText[status]}
        </Tag>
      ),
    },
    {
      title: '计划时间',
      key: 'planTime',
      width: 200,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div>开始: {dayjs(record.planStartTime).format('YYYY-MM-DD HH:mm')}</div>
          <div>结束: {dayjs(record.planEndTime).format('YYYY-MM-DD HH:mm')}</div>
        </div>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/permit/${record.id}`)}>
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <Card
      title="作业票列表"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/create')}>
          新建作业票
        </Button>
      }
    >
      <Space style={{ marginBottom: 16 }} wrap>
        <Search
          placeholder="搜索编号/设备/申请人"
          allowClear
          style={{ width: 250 }}
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          mode="multiple"
          placeholder="筛选状态"
          style={{ width: 300 }}
          allowClear
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value.length > 0 ? value : undefined);
            setPage(1);
          }}
        >
          {Object.entries(PermitStatusText).map(([key, text]) => (
            <Option key={key} value={key}>
              {text}
            </Option>
          ))}
        </Select>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, s) => {
            setPage(p);
            setPageSize(s);
          },
        }}
        scroll={{ x: 1300 }}
      />
    </Card>
  );
}

export default PermitList;
