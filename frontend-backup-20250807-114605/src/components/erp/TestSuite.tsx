import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  ExpandMore,
  PlayArrow,
  Stop,
  Refresh,
  BugReport,
  Speed,
  Security,
  Storage
} from '@mui/icons-material';
import { erpApi } from '@/services/erp';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'warning' | 'running';
  duration: number;
  message: string;
  details?: any;
}

interface TestSuite {
  name: string;
  description: string;
  tests: TestResult[];
  status: 'idle' | 'running' | 'completed';
}

const TestSuite: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      name: 'API Тесты',
      description: 'Тестирование API endpoints',
      status: 'idle',
      tests: [
        { name: 'GET /api/erp/sales/', status: 'idle', duration: 0, message: '' },
        { name: 'POST /api/erp/sales/', status: 'idle', duration: 0, message: '' },
        { name: 'GET /api/erp/reports/sales/', status: 'idle', duration: 0, message: '' },
        { name: 'GET /api/erp/dashboard/metrics/', status: 'idle', duration: 0, message: '' }
      ]
    },
    {
      name: 'Модели данных',
      description: 'Тестирование моделей и валидации',
      status: 'idle',
      tests: [
        { name: 'Создание продажи', status: 'idle', duration: 0, message: '' },
        { name: 'Валидация цены', status: 'idle', duration: 0, message: '' },
        { name: 'Связи между моделями', status: 'idle', duration: 0, message: '' },
        { name: 'Уникальность VIN', status: 'idle', duration: 0, message: '' }
      ]
    },
    {
      name: 'Бизнес-логика',
      description: 'Тестирование бизнес-правил',
      status: 'idle',
      tests: [
        { name: 'Расчет комиссии', status: 'idle', duration: 0, message: '' },
        { name: 'Обновление статуса', status: 'idle', duration: 0, message: '' },
        { name: 'Проверка доступности', status: 'idle', duration: 0, message: '' },
        { name: 'Уведомления', status: 'idle', duration: 0, message: '' }
      ]
    },
    {
      name: 'Производительность',
      description: 'Тестирование производительности',
      status: 'idle',
      tests: [
        { name: 'Загрузка больших отчетов', status: 'idle', duration: 0, message: '' },
        { name: 'Фильтрация данных', status: 'idle', duration: 0, message: '' },
        { name: 'Кэширование', status: 'idle', duration: 0, message: '' },
        { name: 'Оптимизация запросов', status: 'idle', duration: 0, message: '' }
      ]
    },
    {
      name: 'Безопасность',
      description: 'Тестирование безопасности',
      status: 'idle',
      tests: [
        { name: 'Аутентификация', status: 'idle', duration: 0, message: '' },
        { name: 'Авторизация', status: 'idle', duration: 0, message: '' },
        { name: 'Валидация входных данных', status: 'idle', duration: 0, message: '' },
        { name: 'SQL инъекции', status: 'idle', duration: 0, message: '' }
      ]
    }
  ]);

  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<{ passed: number; failed: number; total: number }>({
    passed: 0,
    failed: 0,
    total: 0
  });

  const runTest = async (test: TestResult, suiteIndex: number, testIndex: number): Promise<TestResult> => {
    const startTime = Date.now();
    
    // Обновляем статус на "running"
    const updatedSuites = [...testSuites];
    updatedSuites[suiteIndex].tests[testIndex].status = 'running';
    setTestSuites(updatedSuites);

    try {
      // Имитируем выполнение теста
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
      
      const duration = Date.now() - startTime;
      
      // Случайный результат для демонстрации
      const success = Math.random() > 0.2; // 80% успешных тестов
      
      return {
        ...test,
        status: success ? 'passed' : 'failed',
        duration,
        message: success ? 'Тест прошел успешно' : 'Тест не прошел'
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        ...test,
        status: 'failed',
        duration,
        message: `Ошибка: ${error}`
      };
    }
  };

  const runTestSuite = async (suiteIndex: number) => {
    const suite = testSuites[suiteIndex];
    if (suite.status === 'running') return;

    // Обновляем статус на "running"
    const updatedSuites = [...testSuites];
    updatedSuites[suiteIndex].status = 'running';
    setTestSuites(updatedSuites);

    // Запускаем все тесты в наборе
    for (let i = 0; i < suite.tests.length; i++) {
      const result = await runTest(suite.tests[i], suiteIndex, i);
      
      // Обновляем результат
      updatedSuites[suiteIndex].tests[i] = result;
      setTestSuites([...updatedSuites]);
    }

    // Обновляем статус на "completed"
    updatedSuites[suiteIndex].status = 'completed';
    setTestSuites(updatedSuites);
  };

  const runAllTests = async () => {
    if (running) return;
    
    setRunning(true);
    
    // Сбрасываем результаты
    setResults({ passed: 0, failed: 0, total: 0 });
    
    let totalPassed = 0;
    let totalFailed = 0;
    let totalTests = 0;

    // Запускаем все наборы тестов
    for (let i = 0; i < testSuites.length; i++) {
      await runTestSuite(i);
      
      // Подсчитываем результаты
      const suite = testSuites[i];
      suite.tests.forEach(test => {
        totalTests++;
        if (test.status === 'passed') totalPassed++;
        else if (test.status === 'failed') totalFailed++;
      });
      
      setResults({ passed: totalPassed, failed: totalFailed, total: totalTests });
    }
    
    setRunning(false);
  };

  const resetTests = () => {
    const resetSuites = testSuites.map(suite => ({
      ...suite,
      status: 'idle' as const,
      tests: suite.tests.map(test => ({
        ...test,
        status: 'idle' as const,
        duration: 0,
        message: ''
      }))
    }));
    
    setTestSuites(resetSuites);
    setResults({ passed: 0, failed: 0, total: 0 });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle color="success" />;
      case 'failed':
        return <Error color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'running':
        return <CircularProgress size={20} />;
      default:
        return <BugReport color="action" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'success';
      case 'failed':
        return 'error';
      case 'warning':
        return 'warning';
      case 'running':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Тестирование ERP системы
      </Typography>

      {/* Общая статистика */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Результаты тестирования
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip
                  label={`Пройдено: ${results.passed}`}
                  color="success"
                  icon={<CheckCircle />}
                />
                <Chip
                  label={`Провалено: ${results.failed}`}
                  color="error"
                  icon={<Error />}
                />
                <Chip
                  label={`Всего: ${results.total}`}
                  color="default"
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={runAllTests}
                  disabled={running}
                >
                  Запустить все тесты
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={resetTests}
                  disabled={running}
                >
                  Сбросить
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Наборы тестов */}
      {testSuites.map((suite, suiteIndex) => (
        <Accordion key={suiteIndex} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                {suite.status === 'running' ? (
                  <CircularProgress size={20} sx={{ mr: 2 }} />
                ) : (
                  <BugReport sx={{ mr: 2 }} />
                )}
                <Box>
                  <Typography variant="h6">{suite.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {suite.description}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {suite.status !== 'idle' && (
                  <Chip
                    label={suite.status === 'running' ? 'Выполняется' : 'Завершено'}
                    color={suite.status === 'running' ? 'info' : 'default'}
                    size="small"
                  />
                )}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    runTestSuite(suiteIndex);
                  }}
                  disabled={suite.status === 'running'}
                >
                  Запустить
                </Button>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {suite.tests.map((test, testIndex) => (
                <React.Fragment key={testIndex}>
                  <ListItem>
                    <ListItemIcon>
                      {getStatusIcon(test.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={test.name}
                      secondary={
                        <Box>
                          {test.message && (
                            <Typography variant="body2" color="textSecondary">
                              {test.message}
                            </Typography>
                          )}
                          {test.duration > 0 && (
                            <Typography variant="caption" color="textSecondary">
                              Время выполнения: {formatDuration(test.duration)}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Chip
                      label={test.status}
                      color={getStatusColor(test.status) as any}
                      size="small"
                    />
                  </ListItem>
                  {testIndex < suite.tests.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Рекомендации по улучшению */}
      {results.total > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Рекомендации по улучшению
            </Typography>
            <List>
              {results.failed > 0 && (
                <ListItem>
                  <ListItemIcon>
                    <Error color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Исправить проваленные тесты"
                    secondary="Необходимо исправить ошибки в проваленных тестах для обеспечения стабильности системы"
                  />
                </ListItem>
              )}
              {results.passed > 0 && (
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Добавить новые тесты"
                    secondary="Расширить покрытие тестами для улучшения качества кода"
                  />
                </ListItem>
              )}
              <ListItem>
                <ListItemIcon>
                  <Speed color="info" />
                </ListItemIcon>
                <ListItemText
                  primary="Оптимизировать производительность"
                  secondary="Проанализировать медленные тесты и оптимизировать соответствующий код"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Security color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Улучшить безопасность"
                  secondary="Добавить тесты для проверки уязвимостей безопасности"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TestSuite; 