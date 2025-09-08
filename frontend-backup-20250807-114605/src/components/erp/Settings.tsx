import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Button, 
  Space, 
  Typography, 
  Divider,
  Row,
  Col,
  Avatar,
  Upload,
  message,
  Tabs,
  List,
  Tag,
  Tooltip
} from 'antd';
import { 
  UserOutlined, 
  SettingOutlined, 
  BellOutlined,
  SecurityScanOutlined,
  UploadOutlined,
  SaveOutlined,
  KeyOutlined,
  MailOutlined,
  MobileOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import './Settings.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface SettingsProps {
  // Пропсы для настроек
}

const Settings: React.FC<SettingsProps> = () => {
  const { user } = useAuth();
  const [profileForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatar);

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      });
    }
  }, [user, profileForm]);

  const handleProfileUpdate = async (values: any) => {
    setLoading(true);
    try {
      // Здесь будет API для обновления профиля
      console.log('Обновление профиля:', values);
      message.success('Профиль успешно обновлен');
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      message.error('Ошибка обновления профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityUpdate = async (values: any) => {
    setLoading(true);
    try {
      // Здесь будет API для обновления настроек безопасности
      console.log('Обновление безопасности:', values);
      message.success('Настройки безопасности обновлены');
    } catch (error) {
      console.error('Ошибка обновления безопасности:', error);
      message.error('Ошибка обновления настроек безопасности');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async (values: any) => {
    setLoading(true);
    try {
      // Здесь будет API для обновления настроек уведомлений
      console.log('Обновление уведомлений:', values);
      message.success('Настройки уведомлений обновлены');
    } catch (error) {
      console.error('Ошибка обновления уведомлений:', error);
      message.error('Ошибка обновления настроек уведомлений');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (file: File) => {
    // Здесь будет логика загрузки аватара
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    return false; // Предотвращаем автоматическую загрузку
  };

  const notificationSettings = [
    {
      key: 'email_notifications',
      title: 'Email уведомления',
      description: 'Получать уведомления на email',
      icon: <MailOutlined />,
      default: true
    },
    {
      key: 'push_notifications',
      title: 'Push уведомления',
      description: 'Получать push уведомления в браузере',
      icon: <BellOutlined />,
      default: true
    },
    {
      key: 'task_assignments',
      title: 'Назначение задач',
      description: 'Уведомления о новых назначенных задачах',
      icon: <UserOutlined />,
      default: true
    },
    {
      key: 'task_updates',
      title: 'Обновления задач',
      description: 'Уведомления об изменениях в задачах',
      icon: <SettingOutlined />,
      default: true
    },
    {
      key: 'project_updates',
      title: 'Обновления проектов',
      description: 'Уведомления об изменениях в проектах',
      icon: <SettingOutlined />,
      default: false
    },
    {
      key: 'team_activity',
      title: 'Активность команды',
      description: 'Уведомления о действиях команды',
      icon: <UserOutlined />,
      default: false
    }
  ];

  const securitySettings = [
    {
      key: 'two_factor_auth',
      title: 'Двухфакторная аутентификация',
      description: 'Дополнительная защита аккаунта',
      icon: <SecurityScanOutlined />,
      default: false
    },
    {
      key: 'session_timeout',
      title: 'Автоматический выход',
      description: 'Автоматический выход после неактивности',
      icon: <KeyOutlined />,
      default: true
    },
    {
      key: 'login_notifications',
      title: 'Уведомления о входе',
      description: 'Получать уведомления о новых входах в аккаунт',
      icon: <BellOutlined />,
      default: true
    }
  ];

  return (
    <div className="settings-container">
      <div className="settings-header">
        <Title level={3}>Настройки</Title>
        <Text type="secondary">
          Управление профилем, безопасностью и уведомлениями
        </Text>
      </div>

      <Tabs defaultActiveKey="profile" className="settings-tabs">
        <TabPane tab="Профиль" key="profile">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card title="Основная информация" className="settings-card">
                <Form
                  form={profileForm}
                  layout="vertical"
                  onFinish={handleProfileUpdate}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="first_name"
                        label="Имя"
                        rules={[{ required: true, message: 'Введите имя' }]}
                      >
                        <Input prefix={<UserOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="last_name"
                        label="Фамилия"
                        rules={[{ required: true, message: 'Введите фамилию' }]}
                      >
                        <Input prefix={<UserOutlined />} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="username"
                    label="Имя пользователя"
                    rules={[{ required: true, message: 'Введите имя пользователя' }]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Введите email' },
                      { type: 'email', message: 'Введите корректный email' }
                    ]}
                  >
                    <Input prefix={<MailOutlined />} />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label="Телефон"
                  >
                    <Input prefix={<MobileOutlined />} />
                  </Form.Item>



                  <Form.Item>
                    <Space>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        icon={<SaveOutlined />}
                      >
                        Сохранить изменения
                      </Button>
                      <Button onClick={() => profileForm.resetFields()}>
                        Сбросить
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="Аватар" className="settings-card">
                <div className="avatar-section">
                  <Avatar 
                    size={120} 
                    src={avatarUrl}
                    icon={<UserOutlined />}
                    className="profile-avatar"
                  />
                  <Upload
                    beforeUpload={handleAvatarUpload}
                    showUploadList={false}
                    accept="image/*"
                  >
                    <Button 
                      icon={<UploadOutlined />}
                      style={{ marginTop: 16 }}
                    >
                      Загрузить фото
                    </Button>
                  </Upload>
                  <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                    Рекомендуемый размер: 200x200 пикселей
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Безопасность" key="security">
          <Card title="Настройки безопасности" className="settings-card">
            <Form
              form={securityForm}
              layout="vertical"
              onFinish={handleSecurityUpdate}
            >
              <List
                dataSource={securitySettings}
                renderItem={(item) => (
                  <List.Item className="setting-item">
                    <List.Item.Meta
                      avatar={item.icon}
                      title={item.title}
                      description={item.description}
                    />
                    <Form.Item
                      name={item.key}
                      valuePropName="checked"
                      initialValue={item.default}
                    >
                      <Switch />
                    </Form.Item>
                  </List.Item>
                )}
              />

              <Divider />

              <Form.Item
                name="current_password"
                label="Текущий пароль"
                rules={[{ required: true, message: 'Введите текущий пароль' }]}
              >
                <Input.Password prefix={<KeyOutlined />} />
              </Form.Item>

              <Form.Item
                name="new_password"
                label="Новый пароль"
                rules={[
                  { required: true, message: 'Введите новый пароль' },
                  { min: 8, message: 'Пароль должен содержать минимум 8 символов' }
                ]}
              >
                <Input.Password prefix={<KeyOutlined />} />
              </Form.Item>

              <Form.Item
                name="confirm_password"
                label="Подтвердите пароль"
                dependencies={['new_password']}
                rules={[
                  { required: true, message: 'Подтвердите пароль' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('new_password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Пароли не совпадают'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<KeyOutlined />} />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    Обновить настройки
                  </Button>
                  <Button onClick={() => securityForm.resetFields()}>
                    Сбросить
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="Уведомления" key="notifications">
          <Card title="Настройки уведомлений" className="settings-card">
            <Form
              form={notificationForm}
              layout="vertical"
              onFinish={handleNotificationUpdate}
            >
              <List
                dataSource={notificationSettings}
                renderItem={(item) => (
                  <List.Item className="setting-item">
                    <List.Item.Meta
                      avatar={item.icon}
                      title={item.title}
                      description={item.description}
                    />
                    <Form.Item
                      name={item.key}
                      valuePropName="checked"
                      initialValue={item.default}
                    >
                      <Switch />
                    </Form.Item>
                  </List.Item>
                )}
              />

              <Divider />

              <Form.Item
                name="notification_frequency"
                label="Частота уведомлений"
              >
                <Select placeholder="Выберите частоту">
                  <Option value="immediate">Сразу</Option>
                  <Option value="hourly">Каждый час</Option>
                  <Option value="daily">Раз в день</Option>
                  <Option value="weekly">Раз в неделю</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="quiet_hours"
                label="Тихие часы"
              >
                <Select placeholder="Выберите время">
                  <Option value="22-08">22:00 - 08:00</Option>
                  <Option value="23-07">23:00 - 07:00</Option>
                  <Option value="00-06">00:00 - 06:00</Option>
                  <Option value="none">Отключить</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    Сохранить настройки
                  </Button>
                  <Button onClick={() => notificationForm.resetFields()}>
                    Сбросить
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Settings; 