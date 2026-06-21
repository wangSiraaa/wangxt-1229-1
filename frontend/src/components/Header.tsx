import { Layout, Typography } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header } = Layout;
const { Title } = Typography;

function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const showBack = location.pathname !== '/';

  return (
    <Header
      style={{
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: showBack ? 'pointer' : 'default',
        }}
        onClick={() => showBack && navigate('/')}
      >
        <SafetyCertificateOutlined
          style={{ fontSize: '28px', color: '#1677ff', marginRight: '12px' }}
        />
        <Title level={4} style={{ margin: 0, color: '#1677ff' }}>
          {showBack ? '← 返回列表' : '受限空间作业票管理系统'}
        </Title>
      </div>
    </Header>
  );
}

export default AppHeader;
