import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, Select, DatePicker, Progress, Tag, Avatar, Space, Table, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { erpApi, Project } from '../../services/erp';
import './ProjectList.css';

const { TextArea } = Input;
const { Option } = Select;

interface ProjectListProps {
  onProjectSelect?: (project: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ onProjectSelect }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await erpApi.getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Ошибка загрузки проектов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (values: any) => {
    try {
      const response = await erpApi.createProject(values);
      setProjects(prev => [response.data, ...prev]);
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Ошибка создания проекта:', error);
    }
  };

  const handleUpdateProject = async (values: any) => {
    if (!editingProject) return;

    try {
      const response = await erpApi.updateProject(editingProject.id, values);
      setProjects(prev => prev.map(p => p.id === editingProject.id ? response.data : p));
      setModalVisible(false);
      setEditingProject(null);
      form.resetFields();
    } catch (error) {
      console.error('Ошибка обновления проекта:', error);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    try {
      await erpApi.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Ошибка удаления проекта:', error);
    }
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    form.setFieldsValue({
      name: project.name,
      description: project.description,
      start_date: project.start_date ? new Date(project.start_date) : undefined,
      end_date: project.end_date ? new Date(project.end_date) : undefined,
      budget: project.budget,
    });
    setModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'completed': return 'blue';
      case 'archived': return 'gray';
      case 'on_hold': return 'orange';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Project) => (
        <div className="project-name-cell">
          <h4>{text}</h4>
          <p>{record.description}</p>
        </div>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status_display',
      key: 'status',
      render: (text: string, record: Project) => (
        <Tag color={getStatusColor(record.status)}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Прогресс',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      ),
    },
    {
      title: 'Участники',
      dataIndex: 'member_count',
      key: 'member_count',
      render: (count: number) => (
        <Space>
          <TeamOutlined />
          <span>{count}</span>
        </Space>
      ),
    },
    {
      title: 'Задачи',
      dataIndex: 'task_count',
      key: 'task_count',
      render: (count: number, record: Project) => (
        <div>
          <span>{count}</span>
          {record.overdue_task_count > 0 && (
            <Tag color="red" style={{ marginLeft: 8 }}>
              {record.overdue_task_count} просрочено
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Даты',
      key: 'dates',
      render: (record: Project) => (
        <div className="project-dates">
          <div>
            <CalendarOutlined /> Начало: {new Date(record.start_date).toLocaleDateString()}
          </div>
          {record.end_date && (
            <div>
              <CalendarOutlined /> Окончание: {new Date(record.end_date).toLocaleDateString()}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Бюджет',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget?: number) => (
        budget ? (
          <Space>
            <DollarOutlined />
            <span>{budget.toLocaleString()} ₽</span>
          </Space>
        ) : '-'
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (record: Project) => (
        <Space>
          <Tooltip title="Открыть проект">
            <Button 
              type="primary" 
              size="small"
              onClick={() => onProjectSelect?.(record)}
            >
              Открыть
            </Button>
          </Tooltip>
          <Tooltip title="Редактировать">
            <Button 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Удалить">
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
              onClick={() => handleDeleteProject(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="project-list">
      <div className="project-list-header">
        <h2>Мои проекты</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingProject(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Новый проект
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={projects}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} из ${total} проектов`,
        }}
        className="project-table"
      />

      <Modal
        title={editingProject ? 'Редактировать проект' : 'Новый проект'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingProject(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingProject ? handleUpdateProject : handleCreateProject}
        >
          <Form.Item
            name="name"
            label="Название проекта"
            rules={[{ required: true, message: 'Введите название проекта' }]}
          >
            <Input placeholder="Введите название проекта" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание"
          >
            <TextArea rows={4} placeholder="Опишите проект" />
          </Form.Item>

          <Form.Item
            name="start_date"
            label="Дата начала"
            rules={[{ required: true, message: 'Выберите дату начала' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="Дата окончания"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="budget"
            label="Бюджет (₽)"
          >
            <Input 
              type="number" 
              placeholder="Введите бюджет проекта"
              addonAfter="₽"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingProject ? 'Обновить' : 'Создать'}
              </Button>
              <Button 
                onClick={() => {
                  setModalVisible(false);
                  setEditingProject(null);
                  form.resetFields();
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

export default ProjectList; 