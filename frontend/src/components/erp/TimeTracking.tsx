import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Table, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  TimePicker, 
  message,
  Row,
  Col,
  Statistic,
  Progress,
  Avatar,
  Tooltip,
  Popconfirm,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { erpApi, TimeEntry, Task, Project } from '../../services/erp';
import './TimeTracking.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface TimeTrackingProps {
  projectId?: number;
}

const TimeTracking: React.FC<TimeTrackingProps> = ({ projectId }) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTimeEntries();
    loadTasks();
    loadProjects();
  }, [projectId]);

  useEffect(() => {
    if (activeTimer) {
      const interval = setInterval(() => {
        setActiveTimer(prev => {
          if (prev) {
            return {
              ...prev,
              duration: prev.duration + 60 // Увеличиваем на 1 минуту
            };
          }
          return prev;
        });
      }, 60000); // Обновляем каждую минуту
      setTimerInterval(interval);
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [activeTimer]);

  const loadTimeEntries = async () => {
    try {
      const response = await erpApi.getTimeEntries({ project: projectId });
      setTimeEntries(response.data);
    } catch (error) {
      console.error('Ошибка загрузки записей времени:', error);
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

  const loadProjects = async () => {
    try {
      const response = await erpApi.getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Ошибка загрузки проектов:', error);
    }
  };

  const handleCreateEntry = () => {
    setEditingEntry(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    form.setFieldsValue({
      task: entry.task,
      project: entry.project,
      description: entry.description,
      date: entry.date,
      start_time: entry.start_time,
      end_time: entry.end_time,
      duration: entry.duration
    });
    setModalVisible(true);
  };

  const handleDeleteEntry = async (entryId: number) => {
    try {
      await erpApi.deleteTimeEntry(entryId);
      message.success('Запись времени удалена');
      loadTimeEntries();
    } catch (error) {
      console.error('Ошибка удаления записи времени:', error);
      message.error('Ошибка удаления записи времени');
    }
  };

  const handleStartTimer = async (taskId: number) => {
    try {
      const response = await erpApi.startTimeEntry({
        task: taskId,
        project: projectId,
        description: 'Работа над задачей'
      });
      setActiveTimer(response.data);
      message.success('Таймер запущен');
    } catch (error) {
      console.error('Ошибка запуска таймера:', error);
      message.error('Ошибка запуска таймера');
    }
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;

    try {
      await erpApi.stopTimeEntry(activeTimer.id);
      setActiveTimer(null);
      message.success('Таймер остановлен');
      loadTimeEntries();
    } catch (error) {
      console.error('Ошибка остановки таймера:', error);
      message.error('Ошибка остановки таймера');
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (editingEntry) {
        await erpApi.updateTimeEntry(editingEntry.id, values);
        message.success('Запись времени обновлена');
      } else {
        await erpApi.createTimeEntry({ ...values, project: projectId });
        message.success('Запись времени создана');
      }
      setModalVisible(false);
      loadTimeEntries();
    } catch (error) {
      console.error('Ошибка сохранения записи времени:', error);
      message.error('Ошибка сохранения записи времени');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Moscow'
    });
  };

  const getTimeEntriesStats = () => {
    const totalMinutes = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const todayEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const today = new Date();
      return entryDate.toDateString() === today.toDateString();
    });
    const todayMinutes = todayEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const thisWeekEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      return entryDate >= weekStart;
    });
    const weekMinutes = thisWeekEntries.reduce((sum, entry) => sum + entry.duration, 0);

    return {
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      todayHours: Math.round(todayMinutes / 60 * 10) / 10,
      weekHours: Math.round(weekMinutes / 60 * 10) / 10,
      totalEntries: timeEntries.length
    };
  };

  const stats = getTimeEntriesStats();

  const timeEntryColumns = [
    {
      title: 'Задача',
      dataIndex: 'task',
      key: 'task',
      render: (taskId: number) => {
        const task = tasks.find(t => t.id === taskId);
        return (
          <div>
            <div style={{ fontWeight: 500 }}>
              {task?.title || 'Неизвестная задача'}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {task?.project?.name || 'Неизвестный проект'}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <Text ellipsis={{ tooltip: description }}>
          {description}
        </Text>
      ),
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => (
        <div>
          <CalendarOutlined /> {new Date(date).toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })}
        </div>
      ),
    },
    {
      title: 'Время',
      key: 'time',
      render: (record: TimeEntry) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            {formatTime(record.start_time)} - {formatTime(record.end_time)}
          </div>
          <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
            {formatDuration(record.duration)}
          </div>
        </div>
      ),
    },
    {
      title: 'Статус',
      key: 'status',
      render: (record: TimeEntry) => {
        if (activeTimer && activeTimer.id === record.id) {
          return <Tag color="#1890ff">Активен</Tag>;
        }
        return <Tag color="#52c41a">Завершен</Tag>;
      },
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (record: TimeEntry) => {
        const isActive = activeTimer && activeTimer.id === record.id;
        return (
          <Space>
            <Button 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEditEntry(record)}
            >
              Изменить
            </Button>
            {!isActive && (
              <Button 
                type="primary" 
                size="small" 
                icon={<PlayCircleOutlined />}
                onClick={() => handleStartTimer(record.task)}
              >
                Запустить
              </Button>
            )}
            {isActive && (
              <Button 
                danger 
                size="small" 
                icon={<StopOutlined />}
                onClick={handleStopTimer}
              >
                Остановить
              </Button>
            )}
            <Popconfirm
              title="Удалить запись времени?"
              description="Это действие нельзя отменить"
              onConfirm={() => handleDeleteEntry(record.id)}
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

  return (
    <div className="time-tracking-container">
      <div className="time-tracking-header">
        <Title level={3}>Учет времени</Title>
        <Space>
          {activeTimer && (
            <div className="active-timer">
              <ClockCircleOutlined style={{ color: '#1890ff' }} />
              <Text strong style={{ color: '#1890ff' }}>
                Активен: {formatDuration(activeTimer.duration)}
              </Text>
              <Button 
                danger 
                size="small" 
                icon={<StopOutlined />}
                onClick={handleStopTimer}
              >
                Остановить
              </Button>
            </div>
          )}
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreateEntry}
          >
            Добавить запись
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} className="time-stats">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Всего часов"
              value={stats.totalHours}
              suffix="ч"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Сегодня"
              value={stats.todayHours}
              suffix="ч"
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="На этой неделе"
              value={stats.weekHours}
              suffix="ч"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Всего записей"
              value={stats.totalEntries}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Записи времени" className="time-table-card">
        <Table
          columns={timeEntryColumns}
          dataSource={timeEntries}
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
        title={editingEntry ? 'Редактировать запись времени' : 'Добавить запись времени'}
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
            name="project"
            label="Проект"
            rules={[{ required: true, message: 'Выберите проект' }]}
          >
            <Select placeholder="Выберите проект">
              {projects.map(project => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="task"
            label="Задача"
            rules={[{ required: true, message: 'Выберите задачу' }]}
          >
            <Select placeholder="Выберите задачу">
              {tasks.map(task => (
                <Option key={task.id} value={task.id}>
                  {task.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание работы"
            rules={[{ required: true, message: 'Введите описание работы' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="Опишите выполненную работу"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Дата"
                rules={[{ required: true, message: 'Выберите дату' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Продолжительность (минуты)"
                rules={[{ required: true, message: 'Введите продолжительность' }]}
              >
                <Input type="number" placeholder="Например: 120" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="start_time"
                label="Время начала"
                rules={[{ required: true, message: 'Выберите время начала' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="end_time"
                label="Время окончания"
                rules={[{ required: true, message: 'Выберите время окончания' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
              >
                {editingEntry ? 'Обновить' : 'Создать'}
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

export default TimeTracking; 