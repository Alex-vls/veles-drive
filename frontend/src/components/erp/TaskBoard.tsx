import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Tooltip,
  Alert,
  CircularProgress,
  Fab,
  Menu,
  MenuItem as MenuItemComponent
} from '@mui/material';
import {
  Add,
  MoreVert,
  Assignment,
  Person,
  Schedule,
  Flag,
  Comment,
  Attachment,
  DragIndicator,
  Edit,
  Delete,
  Archive,
  Visibility
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { erpApi } from '@/services/erp';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  assignee: {
    id: number;
    username: string;
    email: string;
  } | null;
  labels: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  comments_count: number;
  attachments_count: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface Column {
  id: number;
  name: string;
  order: number;
  color: string;
  tasks: Task[];
}

interface Board {
  id: number;
  name: string;
  description: string;
  board_type: string;
  color: string;
  columns: Column[];
}

const PRIORITY_COLORS = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
  urgent: '#9C27B0'
};

const PRIORITY_LABELS = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  urgent: 'Срочный'
};

const TaskBoard: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskDialog, setTaskDialog] = useState<{ open: boolean; task: Task | null; columnId: number | null }>({
    open: false,
    task: null,
    columnId: null
  });
  const [newTaskDialog, setNewTaskDialog] = useState<{ open: boolean; columnId: number | null }>({
    open: false,
    columnId: null
  });
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; taskId: number } | null>(null);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await erpApi.get('/project-boards/');
      const boardsData = response.data.results || response.data;
      
      // Загружаем задачи для каждой доски
      const boardsWithTasks = await Promise.all(
        boardsData.map(async (board: any) => {
          const tasksResponse = await erpApi.get(`/project-tasks/?column__board=${board.id}`);
          const tasks = tasksResponse.data.results || tasksResponse.data;
          
          // Группируем задачи по колонкам
          const columnsWithTasks = board.columns.map((column: any) => ({
            ...column,
            tasks: tasks.filter((task: Task) => task.column === column.id)
          }));
          
          return {
            ...board,
            columns: columnsWithTasks
          };
        })
      );
      
      setBoards(boardsWithTasks);
      if (boardsWithTasks.length > 0) {
        setSelectedBoard(boardsWithTasks[0]);
      }
    } catch (err) {
      setError('Ошибка при загрузке досок');
      console.error('Error fetching boards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Обновляем локальное состояние
    const newBoards = boards.map(board => {
      if (board.id !== selectedBoard?.id) return board;
      
      const newColumns = board.columns.map(column => {
        if (column.id.toString() !== source.droppableId) return column;
        
        const newTasks = Array.from(column.tasks);
        const [removed] = newTasks.splice(source.index, 1);
        
        if (source.droppableId === destination.droppableId) {
          newTasks.splice(destination.index, 0, removed);
        }
        
        return { ...column, tasks: newTasks };
      });
      
      // Если задача перемещается в другую колонку
      if (source.droppableId !== destination.droppableId) {
        const sourceColumn = newColumns.find(col => col.id.toString() === source.droppableId);
        const destColumn = newColumns.find(col => col.id.toString() === destination.droppableId);
        
        if (sourceColumn && destColumn) {
          const [movedTask] = sourceColumn.tasks.splice(source.index, 1);
          destColumn.tasks.splice(destination.index, 0, movedTask);
        }
      }
      
      return { ...board, columns: newColumns };
    });
    
    setBoards(newBoards);
    setSelectedBoard(newBoards.find(b => b.id === selectedBoard?.id) || null);

    // Отправляем обновление на сервер
    try {
      await erpApi.patch(`/project-tasks/${draggableId}/`, {
        column: destination.droppableId
      });
    } catch (err) {
      console.error('Error updating task column:', err);
      // Откатываем изменения при ошибке
      fetchBoards();
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      const response = await erpApi.post('/project-tasks/', {
        ...taskData,
        column: newTaskDialog.columnId
      });
      
      // Обновляем локальное состояние
      const newTask = response.data;
      const newBoards = boards.map(board => {
        if (board.id !== selectedBoard?.id) return board;
        
        const newColumns = board.columns.map(column => {
          if (column.id === newTaskDialog.columnId) {
            return { ...column, tasks: [...column.tasks, newTask] };
          }
          return column;
        });
        
        return { ...board, columns: newColumns };
      });
      
      setBoards(newBoards);
      setSelectedBoard(newBoards.find(b => b.id === selectedBoard?.id) || null);
      setNewTaskDialog({ open: false, columnId: null });
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleUpdateTask = async (taskData: any) => {
    if (!taskDialog.task) return;
    
    try {
      const response = await erpApi.patch(`/project-tasks/${taskDialog.task.id}/`, taskData);
      
      // Обновляем локальное состояние
      const updatedTask = response.data;
      const newBoards = boards.map(board => {
        if (board.id !== selectedBoard?.id) return board;
        
        const newColumns = board.columns.map(column => {
          const newTasks = column.tasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          );
          return { ...column, tasks: newTasks };
        });
        
        return { ...board, columns: newColumns };
      });
      
      setBoards(newBoards);
      setSelectedBoard(newBoards.find(b => b.id === selectedBoard?.id) || null);
      setTaskDialog({ open: false, task: null, columnId: null });
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await erpApi.delete(`/project-tasks/${taskId}/`);
      
      // Обновляем локальное состояние
      const newBoards = boards.map(board => {
        if (board.id !== selectedBoard?.id) return board;
        
        const newColumns = board.columns.map(column => ({
          ...column,
          tasks: column.tasks.filter(task => task.id !== taskId)
        }));
        
        return { ...board, columns: newColumns };
      });
      
      setBoards(newBoards);
      setSelectedBoard(newBoards.find(b => b.id === selectedBoard?.id) || null);
      setMenuAnchor(null);
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const renderTask = (task: Task, index: number) => (
    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{
            mb: 2,
            cursor: 'grab',
            transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
            '&:hover': {
              boxShadow: 3
            }
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ flex: 1, mr: 1 }}>
                {task.title}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor({ element: e.currentTarget, taskId: task.id })}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Box>
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              {task.description.substring(0, 100)}
              {task.description.length > 100 && '...'}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
              <Chip
                label={PRIORITY_LABELS[task.priority]}
                size="small"
                sx={{
                  bgcolor: PRIORITY_COLORS[task.priority],
                  color: 'white',
                  fontSize: '0.7rem'
                }}
              />
              {task.labels.map((label) => (
                <Chip
                  key={label.id}
                  label={label.name}
                  size="small"
                  sx={{
                    bgcolor: label.color,
                    color: 'white',
                    fontSize: '0.7rem'
                  }}
                />
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {task.assignee && (
                  <Tooltip title={task.assignee.username}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                      {task.assignee.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </Tooltip>
                )}
                {task.comments_count > 0 && (
                  <Tooltip title={`${task.comments_count} комментариев`}>
                    <IconButton size="small">
                      <Comment fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {task.attachments_count > 0 && (
                  <Tooltip title={`${task.attachments_count} вложений`}>
                    <IconButton size="small">
                      <Attachment fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Schedule fontSize="small" color={isOverdue(task.due_date) ? 'error' : 'action'} />
                <Typography variant="caption" color={isOverdue(task.due_date) ? 'error' : 'textSecondary'}>
                  {formatDate(task.due_date)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );

  const renderColumn = (column: Column) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={column.id}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: column.color }}>
              {column.name}
            </Typography>
            <Chip label={column.tasks.length} size="small" />
          </Box>
          
          <Droppable droppableId={column.id.toString()}>
            {(provided, snapshot) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  minHeight: 200,
                  bgcolor: snapshot.isDraggingOver ? 'action.hover' : 'transparent',
                  borderRadius: 1,
                  p: 1
                }}
              >
                {column.tasks.map((task, index) => renderTask(task, index))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
          
          <Button
            startIcon={<Add />}
            onClick={() => setNewTaskDialog({ open: true, columnId: column.id })}
            sx={{ mt: 2, width: '100%' }}
            variant="outlined"
            size="small"
          >
            Добавить задачу
          </Button>
        </CardContent>
      </Card>
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchBoards}>
            Повторить
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Доска задач
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Add />}>
            Новая доска
          </Button>
          <Button variant="contained" onClick={fetchBoards}>
            Обновить
          </Button>
        </Box>
      </Box>

      {selectedBoard && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {selectedBoard.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {selectedBoard.description}
          </Typography>
        </Box>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={3}>
          {selectedBoard?.columns.map(renderColumn)}
        </Grid>
      </DragDropContext>

      {/* Меню для задач */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItemComponent onClick={() => {
          const task = selectedBoard?.columns
            .flatMap(col => col.tasks)
            .find(t => t.id === menuAnchor?.taskId);
          setTaskDialog({ open: true, task: task || null, columnId: null });
          setMenuAnchor(null);
        }}>
          <Edit sx={{ mr: 1 }} />
          Редактировать
        </MenuItemComponent>
        <MenuItemComponent onClick={() => {
          if (menuAnchor?.taskId) {
            handleDeleteTask(menuAnchor.taskId);
          }
        }}>
          <Delete sx={{ mr: 1 }} />
          Удалить
        </MenuItemComponent>
        <MenuItemComponent>
          <Archive sx={{ mr: 1 }} />
          Архивировать
        </MenuItemComponent>
      </Menu>

      {/* Диалоги для создания/редактирования задач */}
      {/* Здесь должны быть компоненты TaskDialog и NewTaskDialog */}
    </Box>
  );
};

export default TaskBoard; 