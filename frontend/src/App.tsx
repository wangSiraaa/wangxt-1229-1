import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import PermitList from './pages/PermitList';
import PermitDetail from './pages/PermitDetail';
import CreatePermit from './pages/CreatePermit';
import AppHeader from './components/Header';

const { Content } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content style={{ padding: '24px' }}>
        <Routes>
          <Route path="/" element={<PermitList />} />
          <Route path="/create" element={<CreatePermit />} />
          <Route path="/permit/:id" element={<PermitDetail />} />
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
