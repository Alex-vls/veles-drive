import React, { useState } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Progress, Button, Space, Typography } from 'antd';
import { 
  DashboardOutlined, 
  ProjectOutlined, 
  TeamOutlined, 
  ClockCircleOutlined,
  BarChartOutlined,
  SettingOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { erpApi, Project, UserStats } from '../services/erp';
import ProjectList from '../components/erp/ProjectList';
import ProjectBoard from '../components/erp/ProjectBoard';
import './ErpDashboard.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

type MenuKey = 'dashboard' | 'projects' | 'board' | 'team' | 'reports' | 'settings';

interface ErpDashboardProps {
  projectId?: number;
}

const ErpDashboard: React.FC<ErpDashboardProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [selectedMenu, setSelectedMenu] = useState<MenuKey>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (selectedMenu === 'dashboard') {
      loadUserStats();
    }
  }, [selectedMenu]);

  const loadUserStats = async () => {
    setLoading(true);
    try {
      const response = await erpApi.getMyStats();
      setStats(response.data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setSelectedMenu('board');
  };

  const handleMenuClick = (key: MenuKey) => {
    setSelectedMenu(key);
    if (key !== 'board') {
      setSelectedProject(null);
    }
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            <Title level={2}>Панель управления</Title>
            
            {stats && (
              <Row gutter={[16, 16]} className="stats-row">
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Всего задач"
                      value={stats.total_tasks_assigned}
                      prefix={<ProjectOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Завершено"
                      value={stats.completed_tasks}
                      prefix={<ProjectOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Просрочено"
                      value={stats.overdue_tasks}
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Время работы"
                      value={Math.round(stats.total_time_spent / 60)}
                      suffix="ч"
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Card>
                </Col>
              </Row>
            )}

            <Row gutter={[16, 16]} className="quick-actions">
              <Col span={24}>
                <Card title="Быстрые действия">
                  <Space wrap>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setSelectedMenu('projects')}
                    >
                      Создать проект
                    </Button>
                    <Button 
                      icon={<ProjectOutlined />}
                      onClick={() => setSelectedMenu('projects')}
                    >
                      Мои проекты
                    </Button>
                    <Button 
                      icon={<BarChartOutlined />}
                      onClick={() => setSelectedMenu('reports')}
                    >
                      Отчеты
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>

            {stats && Object.keys(stats.tasks_by_project).length > 0 && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="Задачи по проектам">
                    {Object.entries(stats.tasks_by_project).map(([projectName, taskCount]) => (
                      <div key={projectName} className="project-stat-item">
                        <div className="project-stat-info">
                          <Text strong>{projectName}</Text>
                          <Text type="secondary">{taskCount} задач</Text>
                        </div>
                        <Progress 
                          percent={Math.round((taskCount / stats.total_tasks_assigned) * 100)} 
                          size="small" 
                        />
                      </div>
                    ))}
                  </Card>
                </Col>
              </Row>
            )}
          </div>
        );

      case 'projects':
        return (
          <ProjectList onProjectSelect={handleProjectSelect} />
        );

      case 'board':
        if (!selectedProject) {
          return (
            <div className="no-project-selected">
              <Title level={3}>Выберите проект</Title>
              <Text type="secondary">
                Для просмотра доски задач выберите проект из списка
              </Text>
              <Button 
                type="primary" 
                onClick={() => setSelectedMenu('projects')}
                style={{ marginTop: 16 }}
              >
                Перейти к проектам
              </Button>
            </div>
          );
        }
        return (
          <ProjectBoard projectId={selectedProject.id} />
        );

      case 'team':
        return (
          <div className="team-content">
            <Title level={2}>Команда</Title>
            <Text type="secondary">
              Управление участниками команды и их ролями
            </Text>
            {/* Здесь будет компонент управления командой */}
          </div>
        );

      case 'reports':
        return (
          <div className="reports-content">
            <Title level={2}>Отчеты</Title>
            <Text type="secondary">
              Аналитика и отчеты по проектам и задачам
            </Text>
            {/* Здесь будут компоненты отчетов */}
          </div>
        );

      case 'settings':
        return (
          <div className="settings-content">
            <Title level={2}>Настройки</Title>
            <Text type="secondary">
              Настройки ERP системы и пользователя
            </Text>
            {/* Здесь будут настройки */}
          </div>
        );

      default:
        return null;
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Панель управления',
    },
    {
      key: 'projects',
      icon: <ProjectOutlined />,
      label: 'Проекты',
    },
    {
      key: 'board',
      icon: <ProjectOutlined />,
      label: 'Доска задач',
      disabled: !selectedProject,
    },
    {
      key: 'team',
      icon: <TeamOutlined />,
      label: 'Команда',
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Отчеты',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Настройки',
    },
  ];

  return (
    <Layout className="erp-dashboard">
      <Sider width={250} className="erp-sider">
        <div className="erp-logo">
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            VELES ERP
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedMenu]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key as MenuKey)}
          className="erp-menu"
        />
      </Sider>
      
      <Layout>
        <Header className="erp-header">
          <div className="header-content">
            <div className="header-title">
              {selectedMenu === 'dashboard' && 'Панель управления'}
              {selectedMenu === 'projects' && 'Проекты'}
              {selectedMenu === 'board' && selectedProject && `Доска: ${selectedProject.name}`}
              {selectedMenu === 'team' && 'Команда'}
              {selectedMenu === 'reports' && 'Отчеты'}
              {selectedMenu === 'settings' && 'Настройки'}
            </div>
            <div className="header-user">
              <Text>{user?.username}</Text>
            </div>
          </div>
        </Header>
        
        <Content className="erp-content">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ErpDashboard; 