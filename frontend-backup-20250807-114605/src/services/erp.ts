import { apiClient } from './api/client';

export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  status_display: string;
  owner: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  start_date: string;
  end_date?: string;
  budget?: number;
  progress: number;
  members: Array<{
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
  }>;
  member_count: number;
  task_count: number;
  overdue_task_count: number;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: number;
  name: string;
  description: string;
  project: number;
  order: number;
  is_archived: boolean;
  columns: Column[];
  task_count: number;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: number;
  name: string;
  order: number;
  color: string;
  wip_limit?: number;
  is_archived: boolean;
  task_count: number;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  column: Column;
  assignee?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  reporter: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  priority_display: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  status_display: string;
  story_points?: number;
  due_date?: string;
  order: number;
  is_archived: boolean;
  labels: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  comments: Array<{
    id: number;
    content: string;
    author: {
      id: number;
      username: string;
      email: string;
      first_name: string;
      last_name: string;
      avatar?: string;
    };
    created_at: string;
    updated_at: string;
  }>;
  attachments: Array<{
    id: number;
    file: string;
    filename: string;
    file_size: number;
    uploaded_by: {
      id: number;
      username: string;
      email: string;
      first_name: string;
      last_name: string;
      avatar?: string;
    };
    file_url: string;
    uploaded_at: string;
  }>;
  comment_count: number;
  attachment_count: number;
  time_spent: number;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: number;
  task: number;
  content: string;
  author: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface TaskAttachment {
  id: number;
  task: number;
  file: string;
  filename: string;
  file_size: number;
  uploaded_by: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  file_url: string;
  uploaded_at: string;
}

export interface TaskLabel {
  id: number;
  name: string;
  color: string;
  project: number;
  created_at: string;
}

export interface Sprint {
  id: number;
  name: string;
  project: number;
  start_date: string;
  end_date: string;
  goal: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  status_display: string;
  task_count: number;
  completed_task_count: number;
  created_at: string;
}

export interface TimeEntry {
  id: number;
  task: number;
  task_title: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  description: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  duration_hours: number;
  created_at: string;
}

export interface ProjectStats {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  total_time_spent: number;
  progress_percentage: number;
  tasks_by_status: Record<string, number>;
  tasks_by_priority: Record<string, number>;
}

export interface UserStats {
  total_tasks_assigned: number;
  completed_tasks: number;
  overdue_tasks: number;
  total_time_spent: number;
  tasks_by_project: Record<string, number>;
}

export interface Inventory {
  id: number;
  company: number;
  car: any;
  quantity: number;
  cost_price: number;
  selling_price: number;
  status: 'available' | 'reserved' | 'sold' | 'maintenance' | 'damaged';
  location: string;
  notes: string;
  profit_margin: number;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: number;
  company: number;
  car: any;
  customer: any;
  sale_price: number;
  commission: number;
  sale_date: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  company: number;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceOrder {
  id: number;
  company: number;
  customer: any;
  car: any;
  service_items: ServiceOrderItem[];
  total_price: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string;
  completed_date?: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceOrderItem {
  id: number;
  service: Service;
  quantity: number;
  price: number;
}

export interface Financial {
  id: number;
  company: number;
  operation_type: 'income' | 'expense' | 'investment' | 'loan' | 'refund';
  amount: number;
  description: string;
  category: string;
  date: string;
  created_by: any;
  created_at: string;
  updated_at: string;
}

export interface ProjectBoard {
  id: number;
  company: number;
  name: string;
  description: string;
  board_type: 'sales' | 'service' | 'inventory' | 'general';
  color: string;
  is_archived: boolean;
  created_by: any;
  columns: ProjectColumn[];
  labels: TaskLabel[];
  task_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectColumn {
  id: number;
  board: number;
  name: string;
  order: number;
  color: string;
  is_archived: boolean;
  task_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectTask {
  id: number;
  column: number;
  title: string;
  description: string;
  order: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  assignee?: any;
  labels: TaskLabel[];
  related_sale?: number;
  related_service_order?: number;
  related_car?: number;
  related_customer?: number;
  is_archived: boolean;
  created_by: any;
  comments_count: number;
  attachments_count: number;
  created_at: string;
  updated_at: string;
}

export interface TaskHistory {
  id: number;
  task: number;
  user: any;
  action: string;
  old_value: string;
  new_value: string;
  created_at: string;
}

class ErpApiService {
  private baseUrl = '/erp/api';

  // Проекты
  async getProjects(params?: {
    status?: string;
    owner?: number;
    search?: string;
    page?: number;
  }): Promise<{ data: Project[]; count: number }> {
    const response = await apiClient.get(`${this.baseUrl}/projects/`, { params });
    return response.data;
  }

  async getProject(id: number): Promise<{ data: Project }> {
    const response = await apiClient.get(`${this.baseUrl}/projects/${id}/`);
    return response.data;
  }

  async createProject(data: {
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    budget?: number;
  }): Promise<{ data: Project }> {
    const response = await apiClient.post(`${this.baseUrl}/projects/`, data);
    return response.data;
  }

  async updateProject(id: number, data: Partial<Project>): Promise<{ data: Project }> {
    const response = await apiClient.patch(`${this.baseUrl}/projects/${id}/`, data);
    return response.data;
  }

  async deleteProject(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/projects/${id}/`);
  }

  async addProjectMember(projectId: number, data: {
    user_id: number;
    role?: string;
  }): Promise<{ data: any }> {
    const response = await apiClient.post(`${this.baseUrl}/projects/${projectId}/add_member/`, data);
    return response.data;
  }

  async removeProjectMember(projectId: number, data: {
    user_id: number;
  }): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/projects/${projectId}/remove_member/`, { data });
  }

  async getProjectStats(projectId: number): Promise<{ data: ProjectStats }> {
    const response = await apiClient.get(`${this.baseUrl}/projects/${projectId}/stats/`);
    return response.data;
  }

  async getProjectMembers(projectId: number): Promise<{ data: any[] }> {
    const response = await apiClient.get(`${this.baseUrl}/projects/${projectId}/members/`);
    return response.data;
  }

  // Доски
  async getBoards(params?: {
    project?: number;
    is_archived?: boolean;
    search?: string;
  }): Promise<{ data: Board[] }> {
    const response = await apiClient.get(`${this.baseUrl}/boards/`, { params });
    return response.data;
  }

  async getBoard(id: number): Promise<{ data: Board }> {
    const response = await apiClient.get(`${this.baseUrl}/boards/${id}/`);
    return response.data;
  }

  async createBoard(data: {
    name: string;
    description?: string;
    project: number;
  }): Promise<{ data: Board }> {
    const response = await apiClient.post(`${this.baseUrl}/boards/`, data);
    return response.data;
  }

  async updateBoard(id: number, data: Partial<Board>): Promise<{ data: Board }> {
    const response = await apiClient.patch(`${this.baseUrl}/boards/${id}/`, data);
    return response.data;
  }

  async deleteBoard(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/boards/${id}/`);
  }

  async reorderColumns(boardId: number, data: {
    column_orders: Array<{
      column_id: number;
      order: number;
    }>;
  }): Promise<{ data: { status: string } }> {
    const response = await apiClient.post(`${this.baseUrl}/boards/${boardId}/reorder_columns/`, data);
    return response.data;
  }

  // Колонки
  async getColumns(params?: {
    board?: number;
    is_archived?: boolean;
  }): Promise<{ data: Column[] }> {
    const response = await apiClient.get(`${this.baseUrl}/columns/`, { params });
    return response.data;
  }

  async createColumn(data: {
    name: string;
    board: number;
    color?: string;
    wip_limit?: number;
  }): Promise<{ data: Column }> {
    const response = await apiClient.post(`${this.baseUrl}/columns/`, data);
    return response.data;
  }

  async updateColumn(id: number, data: Partial<Column>): Promise<{ data: Column }> {
    const response = await apiClient.patch(`${this.baseUrl}/columns/${id}/`, data);
    return response.data;
  }

  async deleteColumn(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/columns/${id}/`);
  }

  async reorderTasks(columnId: number, data: {
    task_orders: Array<{
      task_id: number;
      order: number;
    }>;
  }): Promise<{ data: { status: string } }> {
    const response = await apiClient.post(`${this.baseUrl}/columns/${columnId}/reorder_tasks/`, data);
    return response.data;
  }

  // Задачи
  async getTasks(params?: {
    status?: string;
    priority?: string;
    assignee?: number;
    project?: number;
    search?: string;
    page?: number;
  }): Promise<{ data: Task[]; count: number }> {
    const response = await apiClient.get(`${this.baseUrl}/tasks/`, { params });
    return response.data;
  }

  async getTask(id: number): Promise<{ data: Task }> {
    const response = await apiClient.get(`${this.baseUrl}/tasks/${id}/`);
    return response.data;
  }

  async createTask(data: {
    title: string;
    description?: string;
    column: number;
    assignee?: number;
    priority?: string;
    story_points?: number;
    due_date?: string;
  }): Promise<{ data: Task }> {
    const response = await apiClient.post(`${this.baseUrl}/tasks/`, data);
    return response.data;
  }

  async updateTask(id: number, data: Partial<Task>): Promise<{ data: Task }> {
    const response = await apiClient.patch(`${this.baseUrl}/tasks/${id}/`, data);
    return response.data;
  }

  async deleteTask(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/tasks/${id}/`);
  }

  async moveTask(taskId: number, data: {
    column_id: number;
    order: number;
  }): Promise<{ data: Task }> {
    const response = await apiClient.post(`${this.baseUrl}/tasks/${taskId}/move_task/`, data);
    return response.data;
  }

  async assignLabels(taskId: number, data: {
    label_ids: number[];
  }): Promise<{ data: Task }> {
    const response = await apiClient.post(`${this.baseUrl}/tasks/${taskId}/assign_labels/`, data);
    return response.data;
  }

  async getTaskHistory(taskId: number): Promise<{ data: any[] }> {
    const response = await apiClient.get(`${this.baseUrl}/tasks/${taskId}/history/`);
    return response.data;
  }

  // Комментарии
  async getTaskComments(taskId: number): Promise<{ data: TaskComment[] }> {
    const response = await apiClient.get(`${this.baseUrl}/task-comments/`, {
      params: { task: taskId }
    });
    return response.data;
  }

  async createTaskComment(data: {
    task: number;
    content: string;
  }): Promise<{ data: TaskComment }> {
    const response = await apiClient.post(`${this.baseUrl}/task-comments/`, data);
    return response.data;
  }

  async updateTaskComment(id: number, data: {
    content: string;
  }): Promise<{ data: TaskComment }> {
    const response = await apiClient.patch(`${this.baseUrl}/task-comments/${id}/`, data);
    return response.data;
  }

  async deleteTaskComment(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/task-comments/${id}/`);
  }

  // Вложения
  async getTaskAttachments(taskId: number): Promise<{ data: TaskAttachment[] }> {
    const response = await apiClient.get(`${this.baseUrl}/task-attachments/`, {
      params: { task: taskId }
    });
    return response.data;
  }

  async uploadTaskAttachment(taskId: number, file: File): Promise<{ data: TaskAttachment }> {
    const formData = new FormData();
    formData.append('task', taskId.toString());
    formData.append('file', file);
    
    const response = await apiClient.post(`${this.baseUrl}/task-attachments/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteTaskAttachment(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/task-attachments/${id}/`);
  }

  // Метки
  async getTaskLabels(projectId: number): Promise<{ data: TaskLabel[] }> {
    const response = await apiClient.get(`${this.baseUrl}/task-labels/`, {
      params: { project: projectId }
    });
    return response.data;
  }

  async createTaskLabel(data: {
    name: string;
    color: string;
    project: number;
  }): Promise<{ data: TaskLabel }> {
    const response = await apiClient.post(`${this.baseUrl}/task-labels/`, data);
    return response.data;
  }

  async updateTaskLabel(id: number, data: Partial<TaskLabel>): Promise<{ data: TaskLabel }> {
    const response = await apiClient.patch(`${this.baseUrl}/task-labels/${id}/`, data);
    return response.data;
  }

  async deleteTaskLabel(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/task-labels/${id}/`);
  }

  // Спринты
  async getSprints(projectId: number): Promise<{ data: Sprint[] }> {
    const response = await apiClient.get(`${this.baseUrl}/sprints/`, {
      params: { project: projectId }
    });
    return response.data;
  }

  async createSprint(data: {
    name: string;
    project: number;
    start_date: string;
    end_date: string;
    goal?: string;
  }): Promise<{ data: Sprint }> {
    const response = await apiClient.post(`${this.baseUrl}/sprints/`, data);
    return response.data;
  }

  async updateSprint(id: number, data: Partial<Sprint>): Promise<{ data: Sprint }> {
    const response = await apiClient.patch(`${this.baseUrl}/sprints/${id}/`, data);
    return response.data;
  }

  async deleteSprint(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/sprints/${id}/`);
  }

  async addTaskToSprint(sprintId: number, data: {
    task_id: number;
  }): Promise<{ data: { status: string } }> {
    const response = await apiClient.post(`${this.baseUrl}/sprints/${sprintId}/add_task/`, data);
    return response.data;
  }

  async removeTaskFromSprint(sprintId: number, data: {
    task_id: number;
  }): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/sprints/${sprintId}/remove_task/`, { data });
  }

  // Учет времени
  async getTimeEntries(params?: {
    task?: number;
    user?: number;
    project?: number;
  }): Promise<{ data: TimeEntry[] }> {
    const response = await apiClient.get(`${this.baseUrl}/time-entries/`, { params });
    return response.data;
  }

  async createTimeEntry(data: {
    task: number;
    description: string;
    start_time: string;
    end_time?: string;
    duration_minutes?: number;
  }): Promise<{ data: TimeEntry }> {
    const response = await apiClient.post(`${this.baseUrl}/time-entries/`, data);
    return response.data;
  }

  async updateTimeEntry(id: number, data: Partial<TimeEntry>): Promise<{ data: TimeEntry }> {
    const response = await apiClient.patch(`${this.baseUrl}/time-entries/${id}/`, data);
    return response.data;
  }

  async deleteTimeEntry(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/time-entries/${id}/`);
  }

  async getMyTimeEntries(): Promise<{ data: TimeEntry[] }> {
    const response = await apiClient.get(`${this.baseUrl}/time-entries/my_time_entries/`);
    return response.data;
  }

  async getProjectTimeEntries(projectId: number): Promise<{ data: TimeEntry[] }> {
    const response = await apiClient.get(`${this.baseUrl}/time-entries/project_time_entries/`, {
      params: { project_id: projectId }
    });
    return response.data;
  }

  // Статистика пользователя
  async getMyStats(): Promise<{ data: UserStats }> {
    const response = await apiClient.get(`${this.baseUrl}/user-stats/my_stats/`);
    return response.data;
  }

  // Inventory API
  async getAllInventory(params?: any): Promise<Inventory[]> {
    const response = await apiClient.get<Inventory[]>('/erp/inventory/', { params });
    return response.data;
  }

  async getInventoryById(id: number): Promise<Inventory> {
    const response = await apiClient.get<Inventory>(`/erp/inventory/${id}/`);
    return response.data;
  }

  async createInventory(data: Partial<Inventory>): Promise<Inventory> {
    const response = await apiClient.post<Inventory>('/erp/inventory/', data);
    return response.data;
  }

  async updateInventory(id: number, data: Partial<Inventory>): Promise<Inventory> {
    const response = await apiClient.put<Inventory>(`/erp/inventory/${id}/`, data);
    return response.data;
  }

  async deleteInventory(id: number): Promise<void> {
    await apiClient.delete(`/erp/inventory/${id}/`);
  }

  async getInventoryStats(): Promise<any> {
    const response = await apiClient.get('/erp/inventory/stats/');
    return response.data;
  }

  // Sales API
  async getAllSales(params?: any): Promise<Sale[]> {
    const response = await apiClient.get<Sale[]>('/erp/sales/', { params });
    return response.data;
  }

  async getSaleById(id: number): Promise<Sale> {
    const response = await apiClient.get<Sale>(`/erp/sales/${id}/`);
    return response.data;
  }

  async createSale(data: Partial<Sale>): Promise<Sale> {
    const response = await apiClient.post<Sale>('/erp/sales/', data);
    return response.data;
  }

  async updateSale(id: number, data: Partial<Sale>): Promise<Sale> {
    const response = await apiClient.put<Sale>(`/erp/sales/${id}/`, data);
    return response.data;
  }

  async deleteSale(id: number): Promise<void> {
    await apiClient.delete(`/erp/sales/${id}/`);
  }

  async getSalesStats(period?: string): Promise<any> {
    const response = await apiClient.get('/erp/sales/stats/', { params: { period } });
    return response.data;
  }

  // Services API
  async getAllServices(params?: any): Promise<Service[]> {
    const response = await apiClient.get<Service[]>('/erp/services/', { params });
    return response.data;
  }

  async getServiceById(id: number): Promise<Service> {
    const response = await apiClient.get<Service>(`/erp/services/${id}/`);
    return response.data;
  }

  async createService(data: Partial<Service>): Promise<Service> {
    const response = await apiClient.post<Service>('/erp/services/', data);
    return response.data;
  }

  async updateService(id: number, data: Partial<Service>): Promise<Service> {
    const response = await apiClient.put<Service>(`/erp/services/${id}/`, data);
    return response.data;
  }

  async deleteService(id: number): Promise<void> {
    await apiClient.delete(`/erp/services/${id}/`);
  }

  // Service Orders API
  async getAllServiceOrders(params?: any): Promise<ServiceOrder[]> {
    const response = await apiClient.get<ServiceOrder[]>('/erp/service-orders/', { params });
    return response.data;
  }

  async getServiceOrderById(id: number): Promise<ServiceOrder> {
    const response = await apiClient.get<ServiceOrder>(`/erp/service-orders/${id}/`);
    return response.data;
  }

  async createServiceOrder(data: Partial<ServiceOrder>): Promise<ServiceOrder> {
    const response = await apiClient.post<ServiceOrder>('/erp/service-orders/', data);
    return response.data;
  }

  async updateServiceOrder(id: number, data: Partial<ServiceOrder>): Promise<ServiceOrder> {
    const response = await apiClient.put<ServiceOrder>(`/erp/service-orders/${id}/`, data);
    return response.data;
  }

  async deleteServiceOrder(id: number): Promise<void> {
    await apiClient.delete(`/erp/service-orders/${id}/`);
  }

  async getServiceOrderStats(): Promise<any> {
    const response = await apiClient.get('/erp/service-orders/stats/');
    return response.data;
  }

  // Financial API
  async getAllFinancial(params?: any): Promise<Financial[]> {
    const response = await apiClient.get<Financial[]>('/erp/financial/', { params });
    return response.data;
  }

  async getFinancialById(id: number): Promise<Financial> {
    const response = await apiClient.get<Financial>(`/erp/financial/${id}/`);
    return response.data;
  }

  async createFinancial(data: Partial<Financial>): Promise<Financial> {
    const response = await apiClient.post<Financial>('/erp/financial/', data);
    return response.data;
  }

  async updateFinancial(id: number, data: Partial<Financial>): Promise<Financial> {
    const response = await apiClient.put<Financial>(`/erp/financial/${id}/`, data);
    return response.data;
  }

  async deleteFinancial(id: number): Promise<void> {
    await apiClient.delete(`/erp/financial/${id}/`);
  }

  async getFinancialStats(period?: string): Promise<any> {
    const response = await apiClient.get('/erp/financial/stats/', { params: { period } });
    return response.data;
  }

  // Project Boards API (Trello-like)
  async getAllProjectBoards(params?: any): Promise<ProjectBoard[]> {
    const response = await apiClient.get<ProjectBoard[]>('/erp/project-boards/', { params });
    return response.data;
  }

  async getProjectBoardById(id: number): Promise<ProjectBoard> {
    const response = await apiClient.get<ProjectBoard>(`/erp/project-boards/${id}/`);
    return response.data;
  }

  async createProjectBoard(data: Partial<ProjectBoard>): Promise<ProjectBoard> {
    const response = await apiClient.post<ProjectBoard>('/erp/project-boards/', data);
    return response.data;
  }

  async updateProjectBoard(id: number, data: Partial<ProjectBoard>): Promise<ProjectBoard> {
    const response = await apiClient.put<ProjectBoard>(`/erp/project-boards/${id}/`, data);
    return response.data;
  }

  async deleteProjectBoard(id: number): Promise<void> {
    await apiClient.delete(`/erp/project-boards/${id}/`);
  }

  async duplicateProjectBoard(id: number): Promise<ProjectBoard> {
    const response = await apiClient.post<ProjectBoard>(`/erp/project-boards/${id}/duplicate/`);
    return response.data;
  }

  // Project Columns API
  async getAllProjectColumns(params?: any): Promise<ProjectColumn[]> {
    const response = await apiClient.get<ProjectColumn[]>('/erp/project-columns/', { params });
    return response.data;
  }

  async getProjectColumnById(id: number): Promise<ProjectColumn> {
    const response = await apiClient.get<ProjectColumn>(`/erp/project-columns/${id}/`);
    return response.data;
  }

  async createProjectColumn(data: Partial<ProjectColumn>): Promise<ProjectColumn> {
    const response = await apiClient.post<ProjectColumn>('/erp/project-columns/', data);
    return response.data;
  }

  async updateProjectColumn(id: number, data: Partial<ProjectColumn>): Promise<ProjectColumn> {
    const response = await apiClient.put<ProjectColumn>(`/erp/project-columns/${id}/`, data);
    return response.data;
  }

  async deleteProjectColumn(id: number): Promise<void> {
    await apiClient.delete(`/erp/project-columns/${id}/`);
  }

  async reorderProjectTasks(id: number, taskIds: number[]): Promise<{ data: { status: string } }> {
    const response = await apiClient.post(`/erp/project-columns/${id}/reorder_tasks/`, { task_ids: taskIds });
    return response.data;
  }

  // Project Tasks API
  async getAllProjectTasks(params?: any): Promise<ProjectTask[]> {
    const response = await apiClient.get<ProjectTask[]>('/erp/project-tasks/', { params });
    return response.data;
  }

  async getProjectTaskById(id: number): Promise<ProjectTask> {
    const response = await apiClient.get<ProjectTask>(`/erp/project-tasks/${id}/`);
    return response.data;
  }

  async createProjectTask(data: Partial<ProjectTask>): Promise<ProjectTask> {
    const response = await apiClient.post<ProjectTask>('/erp/project-tasks/', data);
    return response.data;
  }

  async updateProjectTask(id: number, data: Partial<ProjectTask>): Promise<ProjectTask> {
    const response = await apiClient.put<ProjectTask>(`/erp/project-tasks/${id}/`, data);
    return response.data;
  }

  async deleteProjectTask(id: number): Promise<void> {
    await apiClient.delete(`/erp/project-tasks/${id}/`);
  }

  async moveProjectTaskToColumn(id: number, columnId: number): Promise<{ data: ProjectTask }> {
    const response = await apiClient.post(`/erp/project-tasks/${id}/move_to_column/`, { column_id: columnId });
    return response.data;
  }

  async addProjectTaskComment(id: number, text: string): Promise<{ data: TaskComment }> {
    const response = await apiClient.post<TaskComment>(`/erp/project-tasks/${id}/add_comment/`, { text });
    return response.data;
  }

  async addProjectTaskAttachment(id: number, file: File): Promise<{ data: TaskAttachment }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<TaskAttachment>(`/erp/project-tasks/${id}/add_attachment/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  // Task Comments API
  async getAllTaskComments(params?: any): Promise<TaskComment[]> {
    const response = await apiClient.get<TaskComment[]>('/erp/task-comments/', { params });
    return response.data;
  }

  async getTaskCommentById(id: number): Promise<TaskComment> {
    const response = await apiClient.get<TaskComment>(`/erp/task-comments/${id}/`);
    return response.data;
  }

  async createTaskComment(data: Partial<TaskComment>): Promise<TaskComment> {
    const response = await apiClient.post<TaskComment>('/erp/task-comments/', data);
    return response.data;
  }

  async updateTaskComment(id: number, data: Partial<TaskComment>): Promise<TaskComment> {
    const response = await apiClient.put<TaskComment>(`/erp/task-comments/${id}/`, data);
    return response.data;
  }

  async deleteTaskComment(id: number): Promise<void> {
    await apiClient.delete(`/erp/task-comments/${id}/`);
  }

  // Task Attachments API
  async getAllTaskAttachments(params?: any): Promise<TaskAttachment[]> {
    const response = await apiClient.get<TaskAttachment[]>('/erp/task-attachments/', { params });
    return response.data;
  }

  async getTaskAttachmentById(id: number): Promise<TaskAttachment> {
    const response = await apiClient.get<TaskAttachment>(`/erp/task-attachments/${id}/`);
    return response.data;
  }

  async createTaskAttachment(data: Partial<TaskAttachment>): Promise<TaskAttachment> {
    const response = await apiClient.post<TaskAttachment>('/erp/task-attachments/', data);
    return response.data;
  }

  async updateTaskAttachment(id: number, data: Partial<TaskAttachment>): Promise<TaskAttachment> {
    const response = await apiClient.put<TaskAttachment>(`/erp/task-attachments/${id}/`, data);
    return response.data;
  }

  async deleteTaskAttachment(id: number): Promise<void> {
    await apiClient.delete(`/erp/task-attachments/${id}/`);
  }

  // Task History API
  async getAllTaskHistory(params?: any): Promise<TaskHistory[]> {
    const response = await apiClient.get<TaskHistory[]>('/erp/task-history/', { params });
    return response.data;
  }

  async getTaskHistoryById(id: number): Promise<TaskHistory> {
    const response = await apiClient.get<TaskHistory>(`/erp/task-history/${id}/`);
    return response.data;
  }

  // Dashboard API
  async getDashboardStats(): Promise<any> {
    const response = await apiClient.get('/erp/dashboard/stats/');
    return response.data;
  }

  // Reports API
  async getSalesReport(period?: string): Promise<any> {
    const response = await apiClient.get('/erp/reports/sales/', { params: { period } });
    return response.data;
  }

  async getFinancialReport(period?: string): Promise<any> {
    const response = await apiClient.get('/erp/reports/financial/', { params: { period } });
    return response.data;
  }

  async getTasksReport(period?: string): Promise<any> {
    const response = await apiClient.get('/erp/reports/tasks/', { params: { period } });
    return response.data;
  }
}

export const erpApi = new ErpApiService(); 