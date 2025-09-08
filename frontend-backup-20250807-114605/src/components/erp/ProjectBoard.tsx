import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, Button, Modal, Form, Input, Select, DatePicker, Progress, Tag, Avatar, Tooltip } from 'antd';
import { PlusOutlined, MoreOutlined, UserOutlined, ClockCircleOutlined, TagOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { erpApi } from '../../services/erp';
import './ProjectBoard.css';

const { TextArea } = Input;
const { Option } = Select;

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  assignee?: {
    id: number;
    username: string;
    avatar?: string;
  };
  reporter: {
    id: number;
    username: string;
    avatar?: string;
  };
  due_date?: string;
  story_points?: number;
  labels: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  comment_count: number;
  attachment_count: number;
  time_spent: number;
  order: number;
}

interface Column {
  id: number;
  name: string;
  color: string;
  wip_limit?: number;
  tasks: Task[];
}

interface Board {
  id: number;
  name: string;
  description: string;
  columns: Column[];
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  progress: number;
  boards: Board[];
}

interface ProjectBoardProps {
  projectId: number;
}

const ProjectBoard: React.FC<ProjectBoardProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [taskForm] = Form.useForm();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadProject();
    loadUsers();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const response = await erpApi.getProject(projectId);
      setProject(response.data);
    } catch (error) {
      console.error('Ошибка загрузки проекта:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await erpApi.getProjectMembers(projectId);
      setUsers(response.data);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Перемещение в той же колонке
      const column = project?.boards[0]?.columns.find(col => col.id.toString() === source.droppableId);
      if (column) {
        const newTasks = Array.from(column.tasks);
        const [removed] = newTasks.splice(source.index, 1);
        newTasks.splice(destination.index, 0, removed);
        
        // Обновляем порядок
        const updatedColumns = project.boards[0].columns.map(col => 
          col.id.toString() === source.droppableId 
            ? { ...col, tasks: newTasks }
            : col
        );
        
        setProject(prev => prev ? {
          ...prev,
          boards: prev.boards.map(board => ({
            ...board,
            columns: updatedColumns
          }))
        } : null);

        // Отправляем на сервер
        try {
          await erpApi.reorderTasks(column.id, {
            task_orders: newTasks.map((task, index) => ({
              task_id: task.id,
              order: index
            }))
          });
        } catch (error) {
          console.error('Ошибка обновления порядка задач:', error);
        }
      }
    } else {
      // Перемещение между колонками
      const sourceColumn = project?.boards[0]?.columns.find(col => col.id.toString() === source.droppableId);
      const destColumn = project?.boards[0]?.columns.find(col => col.id.toString() === destination.droppableId);
      
      if (sourceColumn && destColumn) {
        const sourceTasks = Array.from(sourceColumn.tasks);
        const destTasks = Array.from(destColumn.tasks);
        const [movedTask] = sourceTasks.splice(source.index, 1);
        destTasks.splice(destination.index, 0, movedTask);

        const updatedColumns = project.boards[0].columns.map(col => {
          if (col.id.toString() === source.droppableId) {
            return { ...col, tasks: sourceTasks };
          }
          if (col.id.toString() === destination.droppableId) {
            return { ...col, tasks: destTasks };
          }
          return col;
        });

        setProject(prev => prev ? {
          ...prev,
          boards: prev.boards.map(board => ({
            ...board,
            columns: updatedColumns
          }))
        } : null);

        // Отправляем на сервер
        try {
          await erpApi.moveTask(movedTask.id, {
            column_id: destColumn.id,
            order: destination.index
          });
        } catch (error) {
          console.error('Ошибка перемещения задачи:', error);
        }
      }
    }
  };

  const handleCreateTask = async (values: any) => {
    if (!selectedColumn) return;

    try {
      const response = await erpApi.createTask({
        ...values,
        column: selectedColumn.id
      });

      // Добавляем новую задачу в колонку
      const newTask = response.data;
      const updatedColumns = project?.boards[0]?.columns.map(col => 
        col.id === selectedColumn.id 
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col
      );

      setProject(prev => prev ? {
        ...prev,
        boards: prev.boards.map(board => ({
          ...board,
          columns: updatedColumns || board.columns
        }))
      } : null);

      setTaskModalVisible(false);
      taskForm.resetFields();
    } catch (error) {
      console.error('Ошибка создания задачи:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ff4d4f';
      case 'high': return '#ff7a45';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return '#52c41a';
      case 'in_progress': return '#1890ff';
      case 'review': return '#722ed1';
      case 'blocked': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
  };

  if (loading) {
    return <div className="loading">Загрузка проекта...</div>;
  }

  if (!project) {
    return <div className="error">Проект не найден</div>;
  }

  const board = project.boards[0]; // Пока работаем с первой доской

  return (
    <div className="project-board">
      <div className="board-header">
        <div className="board-info">
          <h1>{project.name}</h1>
          <p>{project.description}</p>
          <Progress percent={project.progress} status="active" />
        </div>
        <div className="board-actions">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setTaskModalVisible(true)}
          >
            Новая задача
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="board-columns">
          {board?.columns.map((column) => (
            <div key={column.id} className="board-column">
              <div className="column-header">
                <h3>{column.name}</h3>
                <span className="task-count">{column.tasks.length}</span>
                {column.wip_limit && (
                  <span className="wip-limit">/ {column.wip_limit}</span>
                )}
              </div>

              <Droppable droppableId={column.id.toString()}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`column-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                          >
                            <div className="task-header">
                              <Tag color={getPriorityColor(task.priority)}>
                                {task.priority.toUpperCase()}
                              </Tag>
                              {task.story_points && (
                                <span className="story-points">{task.story_points} SP</span>
                              )}
                            </div>

                            <h4 className="task-title">{task.title}</h4>
                            
                            {task.description && (
                              <p className="task-description">{task.description}</p>
                            )}

                            <div className="task-labels">
                              {task.labels.map(label => (
                                <Tag key={label.id} color={label.color}>
                                  {label.name}
                                </Tag>
                              ))}
                            </div>

                            <div className="task-footer">
                              <div className="task-assignee">
                                {task.assignee ? (
                                  <Tooltip title={task.assignee.username}>
                                    <Avatar 
                                      size="small" 
                                      src={task.assignee.avatar}
                                      icon={<UserOutlined />}
                                    />
                                  </Tooltip>
                                ) : (
                                  <Avatar size="small" icon={<UserOutlined />} />
                                )}
                              </div>

                              <div className="task-meta">
                                {task.due_date && (
                                  <Tooltip title={`Срок: ${new Date(task.due_date).toLocaleDateString()}`}>
                                    <ClockCircleOutlined className="due-date-icon" />
                                  </Tooltip>
                                )}
                                {task.comment_count > 0 && (
                                  <span className="comment-count">{task.comment_count}</span>
                                )}
                                {task.attachment_count > 0 && (
                                  <span className="attachment-count">{task.attachment_count}</span>
                                )}
                                {task.time_spent > 0 && (
                                  <span className="time-spent">{formatTime(task.time_spent)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
              </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>

    <Modal
      title="Новая задача"
      open={taskModalVisible}
      onCancel={() => setTaskModalVisible(false)}
      footer={null}
    >
      <Form
        form={taskForm}
        layout="vertical"
        onFinish={handleCreateTask}
      >
        <Form.Item
          name="title"
          label="Заголовок"
          rules={[{ required: true, message: 'Введите заголовок задачи' }]}
        >
          <Input placeholder="Введите заголовок задачи" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Описание"
        >
          <TextArea rows={4} placeholder="Опишите задачу" />
        </Form.Item>

        <Form.Item
          name="assignee"
          label="Исполнитель"
        >
          <Select placeholder="Выберите исполнителя" allowClear>
            {users.map(user => (
              <Option key={user.id} value={user.id}>
                {user.username}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="priority"
          label="Приоритет"
          initialValue="medium"
        >
          <Select>
            <Option value="low">Низкий</Option>
            <Option value="medium">Средний</Option>
            <Option value="high">Высокий</Option>
            <Option value="urgent">Срочный</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="story_points"
          label="Story Points"
        >
          <Select placeholder="Выберите сложность" allowClear>
            {[1, 2, 3, 5, 8, 13, 21].map(points => (
              <Option key={points} value={points}>{points}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="due_date"
          label="Срок выполнения"
        >
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Создать задачу
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  </div>
  );
};

export default ProjectBoard; 