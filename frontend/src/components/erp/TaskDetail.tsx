import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  Tag, 
  Avatar, 
  Space, 
  Divider, 
  List, 
  Upload, 
  Progress,
  Timeline,
  Card,
  Row,
  Col,
  Typography,
  Tooltip
} from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  TagOutlined, 
  MessageOutlined,
  PaperClipOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { erpApi, Task, TaskComment, TaskAttachment, TaskHistory } from '../../services/erp';
import './TaskDetail.css';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

interface TaskDetailProps {
  taskId: number;
  visible: boolean;
  onClose: () => void;
  onUpdate?: (task: Task) => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ taskId, visible, onClose, onUpdate }) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [commentForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [history, setHistory] = useState<TaskHistory[]>([]);

  useEffect(() => {
    if (visible && taskId) {
      loadTaskData();
    }
  }, [visible, taskId]);

  const loadTaskData = async () => {
    setLoading(true);
    try {
      const [taskResponse, commentsResponse, attachmentsResponse, historyResponse] = await Promise.all([
        erpApi.getTask(taskId),
        erpApi.getTaskComments(taskId),
        erpApi.getTaskAttachments(taskId),
        erpApi.getTaskHistory(taskId)
      ]);

      setTask(taskResponse.data);
      setComments(commentsResponse.data);
      setAttachments(attachmentsResponse.data);
      setHistory(historyResponse.data);

      // Заполняем форму редактирования
      editForm.setFieldsValue({
        title: taskResponse.data.title,
        description: taskResponse.data.description,
        priority: taskResponse.data.priority,
        status: taskResponse.data.status,
        story_points: taskResponse.data.story_points,
        due_date: taskResponse.data.due_date ? new Date(taskResponse.data.due_date) : undefined,
      });
    } catch (error) {
      console.error('Ошибка загрузки данных задачи:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (values: any) => {
    if (!task) return;

    try {
      const response = await erpApi.updateTask(task.id, values);
      setTask(response.data);
      setEditing(false);
      onUpdate?.(response.data);
    } catch (error) {
      console.error('Ошибка обновления задачи:', error);
    }
  };

  const handleAddComment = async (values: any) => {
    if (!task) return;

    try {
      const response = await erpApi.createTaskComment({
        task: task.id,
        content: values.content
      });
      setComments(prev => [response.data, ...prev]);
      commentForm.resetFields();
    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
    }
  };

  const handleUploadAttachment = async (file: File) => {
    if (!task) return;

    try {
      const response = await erpApi.uploadTaskAttachment(task.id, file);
      setAttachments(prev => [response.data, ...prev]);
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!task) {
    return null;
  }

  return (
    <Modal
      title={
        <div className="task-detail-header">
          <span>Задача #{task.id}</span>
          <Space>
            {editing ? (
              <>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />}
                  onClick={() => editForm.submit()}
                >
                  Сохранить
                </Button>
                <Button 
                  icon={<CloseOutlined />}
                  onClick={() => setEditing(false)}
                >
                  Отмена
                </Button>
              </>
            ) : (
              <Button 
                icon={<EditOutlined />}
                onClick={() => setEditing(true)}
              >
                Редактировать
              </Button>
            )}
          </Space>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
      className="task-detail-modal"
    >
      <div className="task-detail-content">
        <Row gutter={[24, 24]}>
          <Col span={16}>
            {/* Основная информация */}
            <Card title="Основная информация" className="task-card">
              {editing ? (
                <Form
                  form={editForm}
                  layout="vertical"
                  onFinish={handleUpdateTask}
                >
                  <Form.Item
                    name="title"
                    label="Заголовок"
                    rules={[{ required: true, message: 'Введите заголовок' }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label="Описание"
                  >
                    <TextArea rows={4} />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="priority"
                        label="Приоритет"
                      >
                        <Select>
                          <Option value="low">Низкий</Option>
                          <Option value="medium">Средний</Option>
                          <Option value="high">Высокий</Option>
                          <Option value="urgent">Срочный</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="status"
                        label="Статус"
                      >
                        <Select>
                          <Option value="todo">К выполнению</Option>
                          <Option value="in_progress">В работе</Option>
                          <Option value="review">На проверке</Option>
                          <Option value="done">Завершено</Option>
                          <Option value="blocked">Заблокировано</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
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
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="due_date"
                        label="Срок выполнения"
                      >
                        <DatePicker showTime style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              ) : (
                <div>
                  <Title level={4}>{task.title}</Title>
                  <Paragraph>{task.description}</Paragraph>
                  
                  <Space wrap>
                    <Tag color={getPriorityColor(task.priority)}>
                      {task.priority_display}
                    </Tag>
                    <Tag color={getStatusColor(task.status)}>
                      {task.status_display}
                    </Tag>
                    {task.story_points && (
                      <Tag color="blue">{task.story_points} SP</Tag>
                    )}
                  </Space>
                </div>
              )}
            </Card>

            {/* Комментарии */}
            <Card title="Комментарии" className="task-card">
              <Form
                form={commentForm}
                onFinish={handleAddComment}
                className="comment-form"
              >
                <Form.Item
                  name="content"
                  rules={[{ required: true, message: 'Введите комментарий' }]}
                >
                  <TextArea rows={3} placeholder="Добавить комментарий..." />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Добавить комментарий
                  </Button>
                </Form.Item>
              </Form>

              <List
                dataSource={comments}
                renderItem={(comment) => (
                  <List.Item className="comment-item">
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          src={comment.author.avatar}
                          icon={<UserOutlined />}
                        />
                      }
                      title={
                        <Space>
                          <Text strong>{comment.author.username}</Text>
                          <Text type="secondary">
                            {new Date(comment.created_at).toLocaleString()}
                          </Text>
                        </Space>
                      }
                      description={comment.content}
                    />
                  </List.Item>
                )}
              />
            </Card>

            {/* Вложения */}
            <Card title="Вложения" className="task-card">
              <Upload
                beforeUpload={(file) => {
                  handleUploadAttachment(file);
                  return false;
                }}
                showUploadList={false}
              >
                <Button icon={<PaperClipOutlined />}>
                  Загрузить файл
                </Button>
              </Upload>

              <List
                dataSource={attachments}
                renderItem={(attachment) => (
                  <List.Item className="attachment-item">
                    <List.Item.Meta
                      avatar={<PaperClipOutlined />}
                      title={
                        <a href={attachment.file_url} target="_blank" rel="noopener noreferrer">
                          {attachment.filename}
                        </a>
                      }
                      description={
                        <Space>
                          <Text type="secondary">
                            {formatFileSize(attachment.file_size)}
                          </Text>
                          <Text type="secondary">
                            {attachment.uploaded_by.username}
                          </Text>
                          <Text type="secondary">
                            {new Date(attachment.uploaded_at).toLocaleDateString()}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col span={8}>
            {/* Метаинформация */}
            <Card title="Метаинформация" className="task-card">
              <div className="meta-item">
                <Text type="secondary">Исполнитель</Text>
                <div className="meta-value">
                  {task.assignee ? (
                    <Space>
                      <Avatar 
                        size="small" 
                        src={task.assignee.avatar}
                        icon={<UserOutlined />}
                      />
                      <Text>{task.assignee.username}</Text>
                    </Space>
                  ) : (
                    <Text type="secondary">Не назначен</Text>
                  )}
                </div>
              </div>

              <div className="meta-item">
                <Text type="secondary">Автор</Text>
                <div className="meta-value">
                  <Space>
                    <Avatar 
                      size="small" 
                      src={task.reporter.avatar}
                      icon={<UserOutlined />}
                    />
                    <Text>{task.reporter.username}</Text>
                  </Space>
                </div>
              </div>

              <div className="meta-item">
                <Text type="secondary">Создана</Text>
                <div className="meta-value">
                  <Text>{new Date(task.created_at).toLocaleDateString()}</Text>
                </div>
              </div>

              <div className="meta-item">
                <Text type="secondary">Обновлена</Text>
                <div className="meta-value">
                  <Text>{new Date(task.updated_at).toLocaleDateString()}</Text>
                </div>
              </div>

              {task.due_date && (
                <div className="meta-item">
                  <Text type="secondary">Срок выполнения</Text>
                  <div className="meta-value">
                    <Text>{new Date(task.due_date).toLocaleDateString()}</Text>
                  </div>
                </div>
              )}

              <div className="meta-item">
                <Text type="secondary">Время работы</Text>
                <div className="meta-value">
                  <Text>{formatTime(task.time_spent)}</Text>
                </div>
              </div>
            </Card>

            {/* Метки */}
            <Card title="Метки" className="task-card">
              <div className="labels-container">
                {task.labels.map(label => (
                  <Tag key={label.id} color={label.color}>
                    {label.name}
                  </Tag>
                ))}
              </div>
            </Card>

            {/* История */}
            <Card title="История изменений" className="task-card">
              <Timeline size="small">
                {history.map((item) => (
                  <Timeline.Item key={item.id}>
                    <div className="history-item">
                      <Text strong>{item.user.username}</Text>
                      <Text type="secondary">{item.action_display}</Text>
                      <Text type="secondary" className="history-time">
                        {new Date(item.timestamp).toLocaleString()}
                      </Text>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default TaskDetail; 