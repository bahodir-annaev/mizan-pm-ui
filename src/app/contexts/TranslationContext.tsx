import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ru' | 'uz';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.projects': 'Projects',
    'nav.tasks': 'Tasks',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    'nav.team': 'Team',
    'nav.clients': 'Clients',
    
    // Header
    'header.search': 'Search projects...',
    'header.myProfile': 'My Profile',
    'header.changePassword': 'Change Password',
    'header.myPreferences': 'My Preferences',
    'header.export': 'Export',
    'header.refresh': 'Refresh data',
    
    // Projects
    'projects.title': 'Projects',
    'projects.subtitle': 'Architecture and construction project management',
    'projects.newProject': 'New Project',
    'projects.searchProjects': 'Search projects...',
    'projects.all': 'All',
    'projects.active': 'Active',
    'projects.completed': 'Completed',
    'projects.late': 'Late',
    
    // Table Headers
    'table.project': 'Project',
    'table.client': 'Client',
    'table.team': 'Team',
    'table.priority': 'Priority',
    'table.workflow': 'Workflow',
    'table.deadline': 'Deadline',
    'table.progress': 'Progress',
    'table.actions': 'Actions',
    'table.task': 'Task',
    'table.assignee': 'Assignee',
    'table.taskType': 'Task Type',
    'table.status': 'Status',
    'table.acceptance': 'Acceptance',
    
    // Priority
    'priority.high': 'High Priority',
    'priority.medium': 'Medium Priority',
    'priority.low': 'Low Priority',
    
    // Status
    'status.start': 'Start',
    'status.progress': 'In Progress',
    'status.review': 'Review',
    'status.late': 'Late',
    'status.end': 'Completed',
    'status.cancelled': 'Cancelled',
    
    // Acceptance
    'acceptance.pending': 'Pending',
    'acceptance.approved': 'Approved',
    'acceptance.revision': 'Needs Revision',
    'acceptance.rejected': 'Rejected',
    
    // Task Types
    'taskType.architecture': 'Architecture',
    'taskType.interior': 'Interior Design',
    'taskType.drawings': 'Working Drawings',
    'taskType.visualization': '3D Visualization',
    'taskType.engineering': 'Engineering',
    'taskType.documentation': 'Documentation',
    
    // Actions
    'actions.edit': 'Edit',
    'actions.delete': 'Delete',
    'actions.view': 'View Details',
    'actions.addTask': 'Add Task',
    'actions.save': 'Save',
    'actions.cancel': 'Cancel',
    
    // Analytics
    'analytics.title': 'Analytics',
    'analytics.subtitle': 'Insights and performance metrics',
    'analytics.completedTasks': 'Completed Tasks',
    'analytics.activeTasks': 'Active Tasks',
    'analytics.overdueTasks': 'Overdue Tasks',
    'analytics.totalHours': 'Total Hours',
    'analytics.avgTimeTask': 'Avg. Time/Task',
    'analytics.taskCompletion': 'Task Completion Timeline',
    'analytics.dailyProductivity': 'Daily productivity trend',
    'analytics.taskDistribution': 'Task Distribution',
    'analytics.byStatus': 'By status',
    'analytics.teamPerformance': 'Team Performance',
    'analytics.individualContributions': 'Individual member contributions',
    'analytics.priorityDistribution': 'Priority Distribution',
    'analytics.tasksByPriority': 'Tasks by priority',
    'analytics.weeklyProductivity': 'Weekly Productivity',
    'analytics.tasksAndHours': 'Tasks completed and hours tracked per day',
    'analytics.timeTracking': 'Time Tracking',
    'analytics.hoursByProject': 'Hours spent by project',
    'analytics.hoursByType': 'Hours spent by task type',
    'analytics.byProject': 'By Project',
    'analytics.byType': 'By Type',
    'analytics.monthlyTimeReport': 'Monthly Time Report',
    'analytics.timeBreakdown': 'Time breakdown by project - Last 30 days',
    'analytics.exportToExcel': 'Export to Excel',
    'analytics.recentlyCompleted': 'Recently Completed Tasks',
    'analytics.last5Completed': 'Last 5 completed tasks',
    'analytics.taskId': 'Task ID',
    'analytics.taskName': 'Task Name',
    'analytics.completed': 'Completed',
    'analytics.timeSpent': 'Time Spent',
    'analytics.totalTime': 'Total time',
    'analytics.efficiency': 'Efficiency',
    'analytics.tasks': 'Tasks',
    'analytics.avgHoursProject': 'Avg Hours/Project',
    'analytics.avgTasksProject': 'Avg Tasks/Project',
    'analytics.hoursPerDay': 'Hours/Day',
    'analytics.activeProjects': 'Active Projects',
    'analytics.members': 'members',
    'analytics.ofTotal': 'of total',
    
    // Dashboard
    'dashboard.title': 'Team Dashboard',
    'dashboard.subtitle': 'Real-time team activity and workload overview',
    'dashboard.totalMembers': 'Total Members',
    'dashboard.activeToday': 'Active Today',
    'dashboard.onLeave': 'On Leave',
    'dashboard.availability': 'Availability',
    'dashboard.searchTeam': 'Search team members...',
    'dashboard.allMembers': 'All Members',
    'dashboard.online': 'Online',
    'dashboard.offline': 'Offline',
    'dashboard.busy': 'Busy',
    'dashboard.sortBy': 'Sort by',
    'dashboard.name': 'Name',
    'dashboard.status': 'Status',
    'dashboard.workload': 'Workload',
    'dashboard.member': 'Member',
    'dashboard.currentWork': 'Current Work',
    'dashboard.todayHours': 'Today Hours',
    'dashboard.weekHours': 'Week Hours',
    'dashboard.notWorking': 'Not working today',
    'dashboard.working': 'Working',
    'dashboard.working.on': 'on',
    'dashboard.active': 'Active',
    'dashboard.idle': 'Idle',
    'dashboard.away': 'Away',
    
    // Common
    'common.loading': 'Loading...',
    'common.noData': 'No data available',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.today': 'Today',
    'common.thisWeek': 'This Week',
    'common.thisMonth': 'This Month',
    'common.thisQuarter': 'This Quarter',
    'common.customRange': 'Custom Range',
    'common.allProjects': 'All Projects',
    'common.allUsers': 'All Users',
    'common.hours': 'Hours',
    'common.days': 'days',
    'common.summary': 'Summary',
    
    // Languages
    'lang.en': 'English',
    'lang.ru': 'Русский язык',
    'lang.uz': "O'zbek tili",
    
    // Days
    'day.mon': 'Mon',
    'day.tue': 'Tue',
    'day.wed': 'Wed',
    'day.thu': 'Thu',
    'day.fri': 'Fri',
    'day.sat': 'Sat',
    'day.sun': 'Sun',
  },
  ru: {
    // Navigation
    'nav.dashboard': 'Команда',
    'nav.projects': 'Проекты',
    'nav.tasks': 'Задачи',
    'nav.analytics': 'Аналитика',
    'nav.settings': 'Настройки',
    'nav.team': 'Команда',
    'nav.clients': 'Клиенты',
    
    // Header
    'header.search': 'Поиск проектов...',
    'header.myProfile': 'Мой профиль',
    'header.changePassword': 'Изменить пароль',
    'header.myPreferences': 'Мои предпочтения',
    'header.export': 'Экспорт',
    'header.refresh': 'Обновить данные',
    
    // Projects
    'projects.title': 'Проекты',
    'projects.subtitle': 'Управление архитектурными и строительными проектами',
    'projects.newProject': 'Новый проект',
    'projects.searchProjects': 'Поиск проектов...',
    'projects.all': 'Все',
    'projects.active': 'Активные',
    'projects.completed': 'Завершенные',
    'projects.late': 'Просроченные',
    
    // Table Headers
    'table.project': 'Проект',
    'table.client': 'Клиент',
    'table.team': 'Команда',
    'table.priority': 'Приоритет',
    'table.workflow': 'Процесс',
    'table.deadline': 'Срок',
    'table.progress': 'Прогресс',
    'table.actions': 'Действия',
    'table.task': 'Задача',
    'table.assignee': 'Исполнитель',
    'table.taskType': 'Тип задачи',
    'table.status': 'Статус',
    'table.acceptance': 'Приемка',
    
    // Priority
    'priority.high': 'Высокий приоритет',
    'priority.medium': 'Средний приоритет',
    'priority.low': 'Низкий приоритет',
    
    // Status
    'status.start': 'Начало',
    'status.progress': 'В работе',
    'status.review': 'Проверка',
    'status.late': 'Просрочено',
    'status.end': 'Завершено',
    'status.cancelled': 'Отменено',
    
    // Acceptance
    'acceptance.pending': 'Ожидает',
    'acceptance.approved': 'Утверждено',
    'acceptance.revision': 'Требуется доработка',
    'acceptance.rejected': 'Отклонено',
    
    // Task Types
    'taskType.architecture': 'Architecture',
    'taskType.interior': 'Interior Design',
    'taskType.drawings': 'Working Drawings',
    'taskType.visualization': '3D Visualization',
    'taskType.engineering': 'Engineering',
    'taskType.documentation': 'Documentation',
    
    // Actions
    'actions.edit': 'Редактировать',
    'actions.delete': 'Удалить',
    'actions.view': 'Подробнее',
    'actions.addTask': 'Добавить задачу',
    'actions.save': 'Сохранить',
    'actions.cancel': 'Отмена',
    
    // Analytics
    'analytics.title': 'Аналитика',
    'analytics.subtitle': 'Аналитика и показатели эффективности',
    'analytics.completedTasks': 'Завершенные задачи',
    'analytics.activeTasks': 'Активные задачи',
    'analytics.overdueTasks': 'Просроченные задачи',
    'analytics.totalHours': 'Всего часов',
    'analytics.avgTimeTask': 'Среднее время/Задача',
    'analytics.taskCompletion': 'График завершения задач',
    'analytics.dailyProductivity': 'Тренд ежедневной продуктивности',
    'analytics.taskDistribution': 'Распределение задач',
    'analytics.byStatus': 'По статусу',
    'analytics.teamPerformance': 'Производительность команды',
    'analytics.individualContributions': 'Вклад отдельных членов команды',
    'analytics.priorityDistribution': 'Распределение по приоритетам',
    'analytics.tasksByPriority': 'Задачи по приоритетам',
    'analytics.weeklyProductivity': 'Недельная продуктивность',
    'analytics.tasksAndHours': 'Завершенные задачи и отслеженные часы в день',
    'analytics.timeTracking': 'Учет времени',
    'analytics.hoursByProject': 'Часы по проектам',
    'analytics.hoursByType': 'Часы по типам задач',
    'analytics.byProject': 'По проектам',
    'analytics.byType': 'По типам',
    'analytics.monthlyTimeReport': 'Месячный отчет по времени',
    'analytics.timeBreakdown': 'Распределение времени по проектам - Последние 30 дней',
    'analytics.exportToExcel': 'Экспорт в Excel',
    'analytics.recentlyCompleted': 'Недавно завершенные задачи',
    'analytics.last5Completed': 'Последние 5 завершенных задач',
    'analytics.taskId': 'ID задачи',
    'analytics.taskName': 'Название задачи',
    'analytics.completed': 'Завершено',
    'analytics.timeSpent': 'Потрачено времени',
    'analytics.totalTime': 'Всего времени',
    'analytics.efficiency': 'Эффективность',
    'analytics.tasks': 'Задачи',
    'analytics.avgHoursProject': 'Среднее часов/Проект',
    'analytics.avgTasksProject': 'Среднее задач/Проект',
    'analytics.hoursPerDay': 'Часов/День',
    'analytics.activeProjects': 'Активные проекты',
    'analytics.members': 'участников',
    'analytics.ofTotal': 'от общего',
    
    // Dashboard
    'dashboard.title': 'Команда',
    'dashboard.subtitle': 'Активность команды и обзор рабочей нагрузки в реальном времени',
    'dashboard.totalMembers': 'Всего членов',
    'dashboard.activeToday': 'Активны сегодня',
    'dashboard.onLeave': 'В отпуске',
    'dashboard.availability': 'Доступность',
    'dashboard.searchTeam': 'Поиск членов команды...',
    'dashboard.allMembers': 'Все члены',
    'dashboard.online': 'Онлайн',
    'dashboard.offline': 'Офлайн',
    'dashboard.busy': 'Занят',
    'dashboard.sortBy': 'Сортировать',
    'dashboard.name': 'Имя',
    'dashboard.status': 'Статус',
    'dashboard.workload': 'Нагрузка',
    'dashboard.member': 'Член',
    'dashboard.currentWork': 'Текущая работа',
    'dashboard.todayHours': 'Часы сегодня',
    'dashboard.weekHours': 'Часы недели',
    'dashboard.notWorking': 'Не работает сегодня',
    'dashboard.working': 'Работает',
    'dashboard.working.on': 'над',
    'dashboard.active': 'Активен',
    'dashboard.idle': 'Неактивен',
    'dashboard.away': 'Отсутствует',
    
    // Common
    'common.loading': 'Загрузка...',
    'common.noData': 'Нет данных',
    'common.error': 'Ошибка',
    'common.success': 'Успешно',
    'common.today': 'Сегодня',
    'common.thisWeek': 'Эта неделя',
    'common.thisMonth': 'Этот месяц',
    'common.thisQuarter': 'Этот квартал',
    'common.customRange': 'Пользовательский диапазон',
    'common.allProjects': 'Все проекты',
    'common.allUsers': 'Все пользователи',
    'common.hours': 'Часы',
    'common.days': 'дней',
    'common.summary': 'Итого',
    
    // Languages
    'lang.en': 'English',
    'lang.ru': 'Русский язык',
    'lang.uz': "O'zbek tili",
    
    // Days
    'day.mon': 'Пн',
    'day.tue': 'Вт',
    'day.wed': 'Ср',
    'day.thu': 'Чт',
    'day.fri': 'Пт',
    'day.sat': 'Сб',
    'day.sun': 'Вс',
  },
  uz: {
    // Navigation
    'nav.dashboard': 'Jamoa',
    'nav.projects': 'Loyihalar',
    'nav.tasks': 'Vazifalar',
    'nav.analytics': 'Analitika',
    'nav.settings': 'Sozlamalar',
    'nav.team': 'Jamoa',
    'nav.clients': 'Mijozlar',
    
    // Header
    'header.search': 'Loyihalarni qidirish...',
    'header.myProfile': 'Mening profilim',
    'header.changePassword': 'Parolni o\'zgartirish',
    'header.myPreferences': 'Mening sozlamalarim',
    'header.export': 'Eksport',
    'header.refresh': 'Ma\'lumotlarni yangilash',
    
    // Projects
    'projects.title': 'Loyihalar',
    'projects.subtitle': 'Me\'morchilik va qurilish loyihalarini boshqarish',
    'projects.newProject': 'Yangi loyiha',
    'projects.searchProjects': 'Loyihalarni qidirish...',
    'projects.all': 'Barchasi',
    'projects.active': 'Faol',
    'projects.completed': 'Tugallangan',
    'projects.late': 'Kechikkan',
    
    // Table Headers
    'table.project': 'Loyiha',
    'table.client': 'Mijoz',
    'table.team': 'Jamoa',
    'table.priority': 'Muhimlik',
    'table.workflow': 'Jarayon',
    'table.deadline': 'Muddat',
    'table.progress': 'Jarayon',
    'table.actions': 'Amallar',
    'table.task': 'Vazifa',
    'table.assignee': 'Mas\'ul',
    'table.taskType': 'Vazifa turi',
    'table.status': 'Holat',
    'table.acceptance': 'Qabul',
    
    // Priority
    'priority.high': 'Yuqori muhimlik',
    'priority.medium': 'O\'rta muhimlik',
    'priority.low': 'Past muhimlik',
    
    // Status
    'status.start': 'Boshlash',
    'status.progress': 'Jarayonda',
    'status.review': 'Tekshirish',
    'status.late': 'Kechikkan',
    'status.end': 'Tugallangan',
    'status.cancelled': 'Bekor qilingan',
    
    // Acceptance
    'acceptance.pending': 'Kutilmoqda',
    'acceptance.approved': 'Tasdiqlangan',
    'acceptance.revision': 'Qayta ishlash kerak',
    'acceptance.rejected': 'Rad etilgan',
    
    // Task Types
    'taskType.architecture': 'Architecture',
    'taskType.interior': 'Interior Design',
    'taskType.drawings': 'Working Drawings',
    'taskType.visualization': '3D Visualization',
    'taskType.engineering': 'Engineering',
    'taskType.documentation': 'Documentation',
    
    // Actions
    'actions.edit': 'Tahrirlash',
    'actions.delete': 'O\'chirish',
    'actions.view': 'Batafsil',
    'actions.addTask': 'Vazifa qo\'shish',
    'actions.save': 'Saqlash',
    'actions.cancel': 'Bekor qilish',
    
    // Analytics
    'analytics.title': 'Analitika',
    'analytics.subtitle': 'Tushunchalar va ishlash ko\'rsatkichlari',
    'analytics.completedTasks': 'Tugallangan vazifalar',
    'analytics.activeTasks': 'Faol vazifalar',
    'analytics.overdueTasks': 'Kechikkan vazifalar',
    'analytics.totalHours': 'Jami soatlar',
    'analytics.avgTimeTask': 'O\'rtacha vaqt/Vazifa',
    'analytics.taskCompletion': 'Vazifani bajarish grafigi',
    'analytics.dailyProductivity': 'Kunlik samaradorlik trendi',
    'analytics.taskDistribution': 'Vazifalarning taqsimlanishi',
    'analytics.byStatus': 'Holat bo\'yicha',
    'analytics.teamPerformance': 'Jamoa samaradorligi',
    'analytics.individualContributions': 'Har bir a\'zoning hissasi',
    'analytics.priorityDistribution': 'Muhimlik bo\'yicha taqsimot',
    'analytics.tasksByPriority': 'Muhimlik bo\'yicha vazifalar',
    'analytics.weeklyProductivity': 'Haftalik samaradorlik',
    'analytics.tasksAndHours': 'Bajarilgan vazifalar va kuzatilgan soatlar kuniga',
    'analytics.timeTracking': 'Vaqtni kuzatish',
    'analytics.hoursByProject': 'Loyihalar bo\'yicha soatlar',
    'analytics.hoursByType': 'Vazifa turlari bo\'yicha soatlar',
    'analytics.byProject': 'Loyihalar bo\'yicha',
    'analytics.byType': 'Turlar bo\'yicha',
    'analytics.monthlyTimeReport': 'Oylik vaqt hisoboti',
    'analytics.timeBreakdown': 'Loyihalar bo\'yicha vaqt taqsimoti - Oxirgi 30 kun',
    'analytics.exportToExcel': 'Excel ga eksport',
    'analytics.recentlyCompleted': 'Yaqinda tugallangan vazifalar',
    'analytics.last5Completed': 'Oxirgi 5 ta tugallangan vazifalar',
    'analytics.taskId': 'Vazifa ID',
    'analytics.taskName': 'Vazifa nomi',
    'analytics.completed': 'Tugallangan',
    'analytics.timeSpent': 'Sarflangan vaqt',
    'analytics.totalTime': 'Jami vaqt',
    'analytics.efficiency': 'Samaradorlik',
    'analytics.tasks': 'Vazifalar',
    'analytics.avgHoursProject': 'O\'rtacha soat/Loyiha',
    'analytics.avgTasksProject': 'O\'rtacha vazifa/Loyiha',
    'analytics.hoursPerDay': 'Soat/Kun',
    'analytics.activeProjects': 'Faol loyihalar',
    'analytics.members': 'a\'zolar',
    'analytics.ofTotal': 'jami',
    
    // Dashboard
    'dashboard.title': 'Jamoa',
    'dashboard.subtitle': 'Real vaqtda jamoa faoliyati va ish yukining umumiy ko\'rinishi',
    'dashboard.totalMembers': 'Jami a\'zolar',
    'dashboard.activeToday': 'Bugun faol',
    'dashboard.onLeave': 'Ta\'tilda',
    'dashboard.availability': 'Mavjudlik',
    'dashboard.searchTeam': 'Jamoa a\'zolarini qidirish...',
    'dashboard.allMembers': 'Barcha a\'zolar',
    'dashboard.online': 'Onlayn',
    'dashboard.offline': 'Oflayn',
    'dashboard.busy': 'Band',
    'dashboard.sortBy': 'Saralash',
    'dashboard.name': 'Ism',
    'dashboard.status': 'Holat',
    'dashboard.workload': 'Ish yuki',
    'dashboard.member': 'A\'zo',
    'dashboard.currentWork': 'Joriy ish',
    'dashboard.todayHours': 'Bugungi soatlar',
    'dashboard.weekHours': 'Haftalik soatlar',
    'dashboard.notWorking': 'Bugun ishlamayapti',
    'dashboard.working': 'Ishlayapti',
    'dashboard.working.on': 'ustida',
    'dashboard.active': 'Faol',
    'dashboard.idle': 'Faol emas',
    'dashboard.away': 'Yo\'q',
    
    // Common
    'common.loading': 'Yuklanmoqda...',
    'common.noData': 'Ma\'lumot yo\'q',
    'common.error': 'Xatolik',
    'common.success': 'Muvaffaqiyatli',
    'common.today': 'Bugun',
    'common.thisWeek': 'Shu hafta',
    'common.thisMonth': 'Shu oy',
    'common.thisQuarter': 'Shu chorak',
    'common.customRange': 'Maxsus oraliq',
    'common.allProjects': 'Barcha loyihalar',
    'common.allUsers': 'Barcha foydalanuvchilar',
    'common.hours': 'Soatlar',
    'common.days': 'kun',
    'common.summary': 'Xulosa',
    
    // Languages
    'lang.en': 'English',
    'lang.ru': 'Русский язык',
    'lang.uz': "O'zbek tili",
    
    // Days
    'day.mon': 'Dush',
    'day.tue': 'Sesh',
    'day.wed': 'Chor',
    'day.thu': 'Pay',
    'day.fri': 'Jum',
    'day.sat': 'Shan',
    'day.sun': 'Yak',
  },
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}