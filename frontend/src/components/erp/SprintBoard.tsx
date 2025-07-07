import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Table, 
  Tag, 
  Progress, 
  Modal, 
  Form, 
  Input, 
  DatePicker, 
  Select, 
  message,
  Row,
  Col,
  Statistic,
  Timeline,
  Avatar,
  Tooltip,
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { erpApi, Sprint, Task } from '../../services/erp';
import './SprintBoard.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface SprintBoardProps {
  projectId: number;
}

const SprintBoard: React.FC<SprintBoardProps> = ({ projectId }) => {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadSprints();
    loadTasks();
  }, [projectId]);

  const loadSprints = async () => {
    try {
      const response = await erpApi.getSprints({ project: projectId });
      setSprints(response.data);
    } catch (error) {
      console.error('Ошибка загрузки спринтов:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await erpApi.getTasks({ project: projectId });
      setTasks(response.data);
    } catch (error) {
      console.error('Ошибка загрузки задач:', error);
    }
  };

  const handleCreateSprint = () => {
    setEditingSprint(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditSprint = (sprint: Sprint) => {
    setEditingSprint(sprint);
    form.setFieldsValue({
      name: sprint.name,
      description: sprint.description,
      start_date: sprint.start_date,
      end_date: sprint.end_date,
      goal: sprint.goal,
      velocity: sprint.velocity
    });
    setModalVisible(true);
  };

  const handleDeleteSprint = async (sprintId: number) => {
    try {
      await erpApi.deleteSprint(sprintId);
      message.success('Спринт удален');
      loadSprints();
    } catch (error) {
      console.error('Ошибка удаления спринта:', error);
      message.error('Ошибка удаления спринта');
    }
  };

  const handleStartSprint = async (sprintId: number) => {
    try {
      await erpApi.startSprint(sprintId);
      message.success('Спринт запущен');
      loadSprints();
    } catch (error) {
      console.error('Ошибка запуска спринта:', error);
      message.error('Ошибка запуска спринта');
    }
  };

  const handleCompleteSprint = async (sprintId: number) => {
    try {
      await erpApi.completeSprint(sprintId);
      message.success('Спринт завершен');
      loadSprints();
    } catch (error) {
      console.error('Ошибка завершения спринта:', error);
      message.error('Ошибка завершения спринта');
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (editingSprint) {
        await erpApi.updateSprint(editingSprint.id, values);
        message.success('Спринт обновлен');
      } else {
        await erpApi.createSprint({ ...values, project: projectId });
        message.success('Спринт создан');
      }
      setModalVisible(false);
      loadSprints();
    } catch (error) {
      console.error('Ошибка сохранения спринта:', error);
      message.error('Ошибка сохранения спринта');
    } finally {
      setLoading(false);
    }
  };

  const getSprintStatus = (sprint: Sprint) => {
    const now = new Date();
    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);

    if (sprint.status === 'completed') {
      return { status: 'completed', text: 'Завершен', color: '#52c41a' };
    }
    if (sprint.status === 'active') {
      return { status: 'active', text: 'Активен', color: '#1890ff' };
    }
    if (now < startDate) {
      return { status: 'planned', text: 'Запланирован', color: '#faad14' };
    }
    if (now > endDate) {
      return { status: 'overdue', text: 'Просрочен', color: '#ff4d4f' };
    }
    return { status: 'active', text: 'Активен', color: '#1890ff' };
  };

  const getSprintProgress = (sprint: Sprint) => {
    const sprintTasks = tasks.filter(task => task.sprint === sprint.id);
    if (sprintTasks.length === 0) return 0;
    
    const completedTasks = sprintTasks.filter(task => task.status === 'completed');
    return Math.round((completedTasks.length / sprintTasks.length) * 100);
  };

  const getSprintStats = (sprint: Sprint) => {
    const sprintTasks = tasks.filter(task => task.sprint === sprint.id);
    const completedTasks = sprintTasks.filter(task => task.status === 'completed');
    const inProgressTasks = sprintTasks.filter(task => task.status === 'in_progress');
    const totalStoryPoints = sprintTasks.reduce((sum, task) => sum + (task.story_points || 0), 0);
    const completedStoryPoints = completedTasks.reduce((sum, task) => sum + (task.story_points || 0), 0);

    return {
      total: sprintTasks.length,
      completed: completedTasks.length,
      inProgress: inProgressTasks.length,
      totalStoryPoints,
      completedStoryPoints,
      velocity: sprint.velocity || 0
    };
  };

  const sprintColumns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Sprint) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Sprint) => {
        const statusInfo = getSprintStatus(record);
        return (
          <Tag color={statusInfo.color}>
            {statusInfo.text}
          </Tag>
        );
      },
    },
    {
      title: 'Даты',
      key: 'dates',
      render: (record: Sprint) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            <CalendarOutlined /> {new Date(record.start_date).toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })}
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            - {new Date(record.end_date).toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })}
          </div>
        </div>
      ),
    },
    {
      title: 'Прогресс',
      key: 'progress',
      render: (record: Sprint) => {
        const progress = getSprintProgress(record);
        const stats = getSprintStats(record);
        return (
          <div>
            <Progress 
              percent={progress} 
              size="small" 
              status={progress === 100 ? 'success' : 'active'}
            />
            <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: 4 }}>
              {stats.completed}/{stats.total} задач
            </div>
          </div>
        );
      },
    },
    {
      title: 'Story Points',
      key: 'storyPoints',
      render: (record: Sprint) => {
        const stats = getSprintStats(record);
        return (
          <div>
            <div style={{ fontWeight: 500 }}>
              {stats.completedStoryPoints}/{stats.totalStoryPoints}
            </div>
            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
              Velocity: {stats.velocity}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (record: Sprint) => {
        const statusInfo = getSprintStatus(record);
        return (
          <Space>
            <Button 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEditSprint(record)}
            >
              Изменить
            </Button>
            {statusInfo.status === 'planned' && (
              <Button 
                type="primary" 
                size="small" 
                icon={<PlayCircleOutlined />}
                onClick={() => handleStartSprint(record.id)}
              >
                Запустить
              </Button>
            )}
            {statusInfo.status === 'active' && (
              <Button 
                type="primary" 
                size="small" 
                icon={<CheckCircleOutlined />}
                onClick={() => handleCompleteSprint(record.id)}
              >
                Завершить
              </Button>
            )}
            <Popconfirm
              title="Удалить спринт?"
              description="Это действие нельзя отменить"
              onConfirm={() => handleDeleteSprint(record.id)}
              okText="Да"
              cancelText="Нет"
            >
              <Button 
                danger 
                size="small" 
                icon={<DeleteOutlined />}
              >
                Удалить
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const getOverallStats = () => {
    const activeSprints = sprints.filter(sprint => getSprintStatus(sprint).status === 'active');
    const completedSprints = sprints.filter(sprint => sprint.status === 'completed');
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const totalStoryPoints = tasks.reduce((sum, task) => sum + (task.story_points || 0), 0);

    return {
      activeSprints: activeSprints.length,
      completedSprints: completedSprints.length,
      totalTasks,
      completedTasks,
      totalStoryPoints,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  const stats = getOverallStats();

  return (
    <div className="sprint-board-container">
      <div className="sprint-board-header">
        <Title level={3}>Управление спринтами</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleCreateSprint}
        >
          Создать спринт
        </Button>
      </div>

      <Row gutter={[16, 16]} className="sprint-stats">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Активные спринты"
              value={stats.activeSprints}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Завершенные спринты"
              value={stats.completedSprints}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Всего задач"
              value={stats.totalTasks}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Выполнено"
              value={stats.completionRate}
              suffix="%"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Спринты" className="sprint-table-card">
        <Table
          columns={sprintColumns}
          dataSource={sprints}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          loading={loading}
        />
      </Card>

      <Modal
        title={editingSprint ? 'Редактировать спринт' : 'Создать спринт'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Название спринта"
            rules={[{ required: true, message: 'Введите название спринта' }]}
          >
            <Input placeholder="Например: Спринт 1 - Аутентификация" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Описание целей и задач спринта"
            />
          </Form.Item>

          <Form.Item
            name="goal"
            label="Цель спринта"
            rules={[{ required: true, message: 'Введите цель спринта' }]}
          >
            <Input.TextArea 
              rows={2} 
              placeholder="Что должно быть достигнуто в этом спринте"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="Дата начала"
                rules={[{ required: true, message: 'Выберите дату начала' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="end_date"
                label="Дата окончания"
                rules={[{ required: true, message: 'Выберите дату окончания' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="velocity"
            label="Планируемая скорость (Story Points)"
          >
            <Input type="number" placeholder="Например: 20" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
              >
                {editingSprint ? 'Обновить' : 'Создать'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SprintBoard; 