import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Select, 
  Avatar, 
  Tag, 
  Space, 
  Typography, 
  Tooltip,
  Popconfirm,
  message,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  UserAddOutlined, 
  UserDeleteOutlined, 
  CrownOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { erpApi, Project } from '../../services/erp';
import './TeamManagement.css';

const { Option } = Select;
const { Title, Text } = Typography;

interface TeamMember {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  role: string;
  role_display: string;
  joined_at: string;
  tasks_assigned: number;
  tasks_completed: number;
  total_time_spent: number;
}

interface TeamManagementProps {
  projectId: number;
  project: Project;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ projectId, project }) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [addMemberForm] = Form.useForm();
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  useEffect(() => {
    loadTeamData();
  }, [projectId]);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      const response = await erpApi.getProjectMembers(projectId);
      setMembers(response.data);
    } catch (error) {
      console.error('Ошибка загрузки команды:', error);
      message.error('Ошибка загрузки данных команды');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (values: any) => {
    try {
      await erpApi.addProjectMember(projectId, values);
      message.success('Участник добавлен в проект');
      setAddMemberModalVisible(false);
      addMemberForm.resetFields();
      loadTeamData();
    } catch (error) {
      console.error('Ошибка добавления участника:', error);
      message.error('Ошибка добавления участника');
    }
  };

  const handleRemoveMember = async (userId: number) => {
    try {
      await erpApi.removeProjectMember(projectId, { user_id: userId });
      message.success('Участник удален из проекта');
      loadTeamData();
    } catch (error) {
      console.error('Ошибка удаления участника:', error);
      message.error('Ошибка удаления участника');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'gold';
      case 'admin': return 'red';
      case 'manager': return 'blue';
      case 'developer': return 'green';
      case 'tester': return 'purple';
      case 'viewer': return 'default';
      default: return 'default';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
  };

  const columns = [
    {
      title: 'Участник',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => (
        <Space>
          <Avatar 
            src={user.avatar}
            icon={<TeamOutlined />}
          />
          <div>
            <div style={{ fontWeight: 500 }}>
              {user.first_name} {user.last_name}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              @{user.username}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Роль',
      dataIndex: 'role_display',
      key: 'role',
      render: (text: string, record: TeamMember) => (
        <Space>
          <Tag color={getRoleColor(record.role)}>
            {record.role === 'owner' && <CrownOutlined style={{ marginRight: 4 }} />}
            {text}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Задачи',
      key: 'tasks',
      render: (record: TeamMember) => (
        <div>
          <div>Назначено: {record.tasks_assigned}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            Завершено: {record.tasks_completed}
          </div>
        </div>
      ),
    },
    {
      title: 'Время работы',
      dataIndex: 'total_time_spent',
      key: 'time',
      render: (time: number) => (
        <Space>
          <ClockCircleOutlined />
          <span>{formatTime(time)}</span>
        </Space>
      ),
    },
    {
      title: 'Дата присоединения',
      dataIndex: 'joined_at',
      key: 'joined_at',
      render: (date: string) => (
        <Text>{new Date(date).toLocaleDateString()}</Text>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (record: TeamMember) => (
        <Space>
          {record.role !== 'owner' && (
            <Popconfirm
              title="Удалить участника?"
              description="Участник будет удален из проекта. Это действие нельзя отменить."
              onConfirm={() => handleRemoveMember(record.user.id)}
              okText="Да"
              cancelText="Нет"
            >
              <Button 
                type="text" 
                danger 
                icon={<UserDeleteOutlined />}
                size="small"
              >
                Удалить
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const teamStats = {
    totalMembers: members.length,
    activeMembers: members.filter(m => m.tasks_assigned > 0).length,
    totalTasks: members.reduce((sum, m) => sum + m.tasks_assigned, 0),
    completedTasks: members.reduce((sum, m) => sum + m.tasks_completed, 0),
    totalTime: members.reduce((sum, m) => sum + m.total_time_spent, 0),
  };

  return (
    <div className="team-management">
      <div className="team-header">
        <Title level={3}>Команда проекта</Title>
        <Button 
          type="primary" 
          icon={<UserAddOutlined />}
          onClick={() => setAddMemberModalVisible(true)}
        >
          Добавить участника
        </Button>
      </div>

      {/* Статистика команды */}
      <Row gutter={[16, 16]} className="team-stats">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Всего участников"
              value={teamStats.totalMembers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Активных участников"
              value={teamStats.activeMembers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Всего задач"
              value={teamStats.totalTasks}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Время работы"
              value={Math.round(teamStats.totalTime / 60)}
              suffix="ч"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Таблица участников */}
      <Card className="team-table-card">
        <Table
          columns={columns}
          dataSource={members}
          loading={loading}
          rowKey="id"
          pagination={false}
          className="team-table"
        />
      </Card>

      {/* Модальное окно добавления участника */}
      <Modal
        title="Добавить участника в проект"
        open={addMemberModalVisible}
        onCancel={() => {
          setAddMemberModalVisible(false);
          addMemberForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={addMemberForm}
          layout="vertical"
          onFinish={handleAddMember}
        >
          <Form.Item
            name="user_id"
            label="Пользователь"
            rules={[{ required: true, message: 'Выберите пользователя' }]}
          >
            <Select
              placeholder="Выберите пользователя"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {availableUsers.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} (@{user.username})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="role"
            label="Роль"
            rules={[{ required: true, message: 'Выберите роль' }]}
          >
            <Select placeholder="Выберите роль">
              <Option value="admin">Администратор</Option>
              <Option value="manager">Менеджер</Option>
              <Option value="developer">Разработчик</Option>
              <Option value="tester">Тестировщик</Option>
              <Option value="viewer">Наблюдатель</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Добавить
              </Button>
              <Button 
                onClick={() => {
                  setAddMemberModalVisible(false);
                  addMemberForm.resetFields();
                }}
              >
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeamManagement; 