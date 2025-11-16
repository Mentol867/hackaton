// ===== INITIALIZATION SCRIPT FOR STANDALONE VERSION =====
// This script initializes localStorage with sample data from JSON files

// Sample announcements data
const sampleAnnouncements = [
    {
        "id": "ann1",
        "title": "Лекція з штучного інтелекту для студентів",
        "category": "lecture",
        "description": "Запрошуємо експертів з галузі штучного інтелекту для проведення лекції для студентів комп'ютерних наук. Розглянемо сучасні тенденції в машинному навчанні та практичні застосування AI.",
        "authorId": "univ1",
        "organizationType": "university",
        "eventDate": "2024-12-15",
        "eventTime": "14:00",
        "duration": "2hours",
        "location": "Аудиторія 101, головний корпус",
        "format": "offline",
        "targetAudience": "Студенти 3-4 курсів спеціальності \"Комп'ютерні науки\"",
        "requirements": "Досвід роботи з AI/ML мінімум 3 роки, публікації в галузі",
        "compensation": "Гонорар 5000 грн, сертифікат лектора",
        "contactEmail": "ai.lectures@knu.ua",
        "contactPhone": "+380442393111",
        "urgent": true,
        "createdAt": "2024-11-10T10:00:00.000Z",
        "updatedAt": "2024-11-10T10:00:00.000Z",
        "isActive": true,
        "viewCount": 45,
        "status": "active"
    },
    {
        "id": "ann2",
        "title": "Пошук університету для проведення воркшопу з кібербезпеки",
        "category": "workshop",
        "description": "Наша компанія шукає партнера-університет для проведення практичного воркшопу з кібербезпеки. Маємо досвідчених спеціалістів та готові поділитися знаннями зі студентами.",
        "authorId": "comp1",
        "organizationType": "company",
        "eventDate": "2024-12-20",
        "eventTime": "10:00",
        "duration": "halfday",
        "location": "Буде узгоджено з університетом",
        "format": "hybrid",
        "targetAudience": "Студенти IT-спеціальностей, викладачі",
        "requirements": "Наявність комп'ютерного класу, проектор, інтернет",
        "compensation": "Безкоштовно, сертифікати учасникам",
        "contactEmail": "workshops@techukraine.com",
        "contactPhone": "+380443334455",
        "urgent": false,
        "createdAt": "2024-11-12T09:30:00.000Z",
        "updatedAt": "2024-11-12T09:30:00.000Z",
        "isActive": true,
        "viewCount": 32,
        "status": "active"
    },
    {
        "id": "ann3",
        "title": "Семінар з інноваційних технологій в освіті",
        "category": "seminar",
        "description": "КПІ організовує семінар для представників IT-компаній щодо впровадження інноваційних технологій в освітній процес. Обговоримо можливості співпраці та спільні проекти.",
        "authorId": "univ2",
        "organizationType": "university",
        "eventDate": "2024-12-10",
        "eventTime": "15:30",
        "duration": "3hours",
        "location": "Конференц-зал, корпус №7",
        "format": "offline",
        "targetAudience": "Представники IT-компаній, стартапів",
        "requirements": "Досвід роботи в IT-галузі, інтерес до освітніх технологій",
        "compensation": "Нетворкінг, можливості для партнерства",
        "contactEmail": "innovation@kpi.ua",
        "contactPhone": "+380442048888",
        "urgent": false,
        "createdAt": "2024-11-08T14:15:00.000Z",
        "updatedAt": "2024-11-08T14:15:00.000Z",
        "isActive": true,
        "viewCount": 28,
        "status": "active"
    }
];

// Sample users data
const sampleUsers = [
    {
        "id": "univ1",
        "email": "contact@knu.ua",
        "type": "university",
        "universityName": "Київський національний університет імені Тараса Шевченка",
        "contactPerson": "Іван Петренко",
        "phone": "+380442393111",
        "address": "вул. Володимирська, 60, Київ, 01033",
        "website": "https://knu.ua",
        "description": "Провідний класичний університет України з багатовіковою історією",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "isActive": true,
        "emailVerified": true,
        "lastLogin": "2024-11-10T09:00:00.000Z"
    },
    {
        "id": "univ2",
        "email": "info@kpi.ua",
        "type": "university",
        "universityName": "Національний технічний університет України \"КПІ\"",
        "contactPerson": "Марія Коваленко",
        "phone": "+380442048888",
        "address": "просп. Перемоги, 37, Київ, 03056",
        "website": "https://kpi.ua",
        "description": "Провідний технічний університет України",
        "createdAt": "2024-01-20T11:00:00.000Z",
        "isActive": true,
        "emailVerified": true,
        "lastLogin": "2024-11-08T13:00:00.000Z"
    },
    {
        "id": "comp1",
        "email": "contact@techukraine.com",
        "type": "company",
        "companyName": "TechUkraine",
        "industry": "it",
        "contactPerson": "Олександр Сидоренко",
        "phone": "+380443334455",
        "address": "вул. Хрещатик, 22, Київ, 01001",
        "website": "https://techukraine.com",
        "description": "Інноваційна IT-компанія, що спеціалізується на кібербезпеці",
        "employeeCount": "50-100",
        "createdAt": "2024-02-01T12:00:00.000Z",
        "isActive": true,
        "emailVerified": true,
        "lastLogin": "2024-11-12T08:30:00.000Z"
    }
];

// Default configuration
const defaultConfig = {
    "categories": {
        "lecture": "Лекція",
        "seminar": "Семінар",
        "workshop": "Майстер-клас",
        "conference": "Конференція",
        "internship": "Стажування",
        "research": "Дослідження",
        "other": "Інше"
    },
    "industries": {
        "it": "Інформаційні технології",
        "finance": "Фінанси та банківська справа",
        "healthcare": "Охорона здоров'я",
        "education": "Освіта",
        "manufacturing": "Виробництво",
        "retail": "Роздрібна торгівля",
        "consulting": "Консалтинг",
        "marketing": "Маркетинг та реклама",
        "other": "Інше"
    },
    "durations": {
        "30min": "30 хвилин",
        "1hour": "1 година",
        "1.5hours": "1.5 години",
        "2hours": "2 години",
        "3hours": "3 години",
        "halfday": "Пів дня",
        "fullday": "Повний день",
        "multiday": "Кілька днів"
    },
    "formats": {
        "offline": "Офлайн",
        "online": "Онлайн",
        "hybrid": "Гібридний"
    },
    "settings": {
        "maxAnnouncementTitleLength": 100,
        "maxAnnouncementDescriptionLength": 1000,
        "maxRequirementsLength": 500,
        "autoSaveInterval": 30000,
        "itemsPerPage": 12,
        "notificationDuration": 5000
    }
};

// Initialize localStorage with sample data
function initializeData() {
    console.log('Initializing localStorage with sample data...');
    
    // Only initialize if data doesn't exist
    if (!localStorage.getItem('announcements')) {
        localStorage.setItem('announcements', JSON.stringify(sampleAnnouncements));
        console.log('Sample announcements initialized');
    }
    
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(sampleUsers));
        console.log('Sample users initialized');
    }
    
    if (!localStorage.getItem('config')) {
        localStorage.setItem('config', JSON.stringify(defaultConfig));
        console.log('Default config initialized');
    }
    
    console.log('Data initialization complete!');
}

// Auto-initialize when script loads
initializeData();