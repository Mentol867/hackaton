// ===== DATA API FOR JSON FILE MANAGEMENT =====
// Handles loading and saving data to JSON files

class DataAPI {
    constructor() {
        this.cache = new Map();
        this.config = null;
        this.init();
    }

    async init() {
        try {
            await this.loadConfig();
        } catch (error) {
            console.error('Failed to initialize DataAPI:', error);
        }
    }

    // ===== CONFIGURATION MANAGEMENT =====
    async loadConfig() {
        try {
            // First try to load from localStorage
            const localConfig = localStorage.getItem('config');
            if (localConfig) {
                this.config = JSON.parse(localConfig);
                this.cache.set('config', this.config);
                return this.config;
            }

            // If no localStorage data, try to load from JSON file (only works with server)
            try {
                const response = await fetch('./data/config.json');
                if (response.ok) {
                    this.config = await response.json();
                    // Save to localStorage for future use
                    localStorage.setItem('config', JSON.stringify(this.config));
                    this.cache.set('config', this.config);
                    return this.config;
                }
            } catch (fetchError) {
                console.log('Could not fetch config from server, using default');
            }

            // Fallback to default config
            this.config = this.getDefaultConfig();
            localStorage.setItem('config', JSON.stringify(this.config));
            this.cache.set('config', this.config);
            return this.config;
        } catch (error) {
            console.error('Error loading config:', error);
            // Fallback to default config
            this.config = this.getDefaultConfig();
            return this.config;
        }
    }

    getConfig() {
        return this.config || this.getDefaultConfig();
    }

    getDefaultConfig() {
        return {
            categories: {
                'lecture': 'Лекція',
                'seminar': 'Семінар',
                'workshop': 'Майстер-клас',
                'conference': 'Конференція',
                'internship': 'Стажування',
                'research': 'Дослідження',
                'other': 'Інше'
            },
            industries: {
                'it': 'Інформаційні технології',
                'finance': 'Фінанси та банківська справа',
                'healthcare': 'Охорона здоров\'я',
                'education': 'Освіта',
                'manufacturing': 'Виробництво',
                'retail': 'Роздрібна торгівля',
                'consulting': 'Консалтинг',
                'marketing': 'Маркетинг та реклама',
                'other': 'Інше'
            },
            durations: {
                '30min': '30 хвилин',
                '1hour': '1 година',
                '1.5hours': '1.5 години',
                '2hours': '2 години',
                '3hours': '3 години',
                'halfday': 'Пів дня',
                'fullday': 'Повний день',
                'multiday': 'Кілька днів'
            },
            formats: {
                'offline': 'Офлайн',
                'online': 'Онлайн',
                'hybrid': 'Гібридний'
            },
            settings: {
                maxAnnouncementTitleLength: 100,
                maxAnnouncementDescriptionLength: 1000,
                maxRequirementsLength: 500,
                autoSaveInterval: 30000,
                itemsPerPage: 12,
                notificationDuration: 5000
            }
        };
    }

    // ===== USERS MANAGEMENT =====
    async loadUsers() {
        const cacheKey = 'users';
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            // First try to load from localStorage
            const localData = localStorage.getItem('users');
            if (localData) {
                const users = JSON.parse(localData);
                this.cache.set(cacheKey, users);
                return users;
            }

            // If no localStorage data, try to load from JSON file (only works with server)
            try {
                const response = await fetch('./data/users.json');
                if (response.ok) {
                    const data = await response.json();
                    // Save to localStorage for future use
                    localStorage.setItem('users', JSON.stringify(data.users));
                    this.cache.set(cacheKey, data.users);
                    return data.users;
                }
            } catch (fetchError) {
                console.log('Could not fetch from server, using localStorage only');
            }

            // If both fail, return empty array
            const emptyUsers = [];
            this.cache.set(cacheKey, emptyUsers);
            return emptyUsers;
        } catch (error) {
            console.error('Error loading users:', error);
            const emptyUsers = [];
            this.cache.set(cacheKey, emptyUsers);
            return emptyUsers;
        }
    }

    async saveUsers(users) {
        try {
            // Try to save to server first
            try {
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(users)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        // Update cache
                        this.cache.set('users', users);
                        localStorage.setItem('users', JSON.stringify(users));
                        console.log('Users saved to server and cache');
                        return { success: true, message: 'Користувачів збережено на сервер' };
                    }
                }
            } catch (serverError) {
                console.log('Server not available, saving to localStorage only');
            }
            
            // Fallback to localStorage only
            this.cache.set('users', users);
            localStorage.setItem('users', JSON.stringify(users));
            
            console.log('Users saved to cache and localStorage');
            return { success: true, message: 'Користувачів збережено' };
        } catch (error) {
            console.error('Error saving users:', error);
            return { success: false, message: 'Помилка збереження користувачів' };
        }
    }

    // ===== ANNOUNCEMENTS MANAGEMENT =====
    async loadAnnouncements() {
        const cacheKey = 'announcements';
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            // First try to load from localStorage
            const localData = localStorage.getItem('announcements');
            if (localData) {
                const announcements = JSON.parse(localData);
                this.cache.set(cacheKey, announcements);
                return announcements;
            }

            // If no localStorage data, try to load from JSON file (only works with server)
            try {
                const response = await fetch('./data/announcements.json');
                if (response.ok) {
                    const data = await response.json();
                    // Save to localStorage for future use
                    localStorage.setItem('announcements', JSON.stringify(data.announcements));
                    this.cache.set(cacheKey, data.announcements);
                    return data.announcements;
                }
            } catch (fetchError) {
                console.log('Could not fetch from server, using localStorage only');
            }

            // If both fail, return empty array
            const emptyAnnouncements = [];
            this.cache.set(cacheKey, emptyAnnouncements);
            return emptyAnnouncements;
        } catch (error) {
            console.error('Error loading announcements:', error);
            const emptyAnnouncements = [];
            this.cache.set(cacheKey, emptyAnnouncements);
            return emptyAnnouncements;
        }
    }

    async saveAnnouncements(announcements) {
        try {
            // Try to save to server first
            try {
                const response = await fetch('/api/announcements', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(announcements)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        // Update cache
                        this.cache.set('announcements', announcements);
                        localStorage.setItem('announcements', JSON.stringify(announcements));
                        console.log('Announcements saved to server and cache');
                        return { success: true, message: 'Оголошення збережено на сервер' };
                    }
                }
            } catch (serverError) {
                console.log('Server not available, saving to localStorage only');
            }
            
            // Fallback to localStorage only
            this.cache.set('announcements', announcements);
            localStorage.setItem('announcements', JSON.stringify(announcements));
            
            console.log('Announcements saved to cache and localStorage');
            return { success: true, message: 'Оголошення збережено' };
        } catch (error) {
            console.error('Error saving announcements:', error);
            return { success: false, message: 'Помилка збереження оголошень' };
        }
    }

    // ===== CACHE MANAGEMENT =====
    clearCache() {
        this.cache.clear();
    }

    getCacheSize() {
        return this.cache.size;
    }

    getCacheKeys() {
        return Array.from(this.cache.keys());
    }

    // ===== UTILITY METHODS =====
    getCategoryDisplayName(category) {
        const config = this.getConfig();
        return config.categories[category] || category;
    }

    getIndustryDisplayName(industry) {
        const config = this.getConfig();
        return config.industries[industry] || industry;
    }

    getDurationDisplayName(duration) {
        const config = this.getConfig();
        return config.durations[duration] || duration;
    }

    getFormatDisplayName(format) {
        const config = this.getConfig();
        return config.formats[format] || format;
    }

    getSetting(key) {
        const config = this.getConfig();
        return config.settings[key];
    }

    // ===== MIGRATION HELPERS =====
    async migrateFromLocalStorage() {
        try {
            console.log('Starting migration from localStorage to JSON...');
            
            // Migrate users
            const existingUsers = localStorage.getItem('users');
            if (existingUsers) {
                const users = JSON.parse(existingUsers);
                await this.saveUsers(users);
                console.log(`Migrated ${users.length} users`);
            }

            // Migrate announcements
            const existingAnnouncements = localStorage.getItem('announcements');
            if (existingAnnouncements) {
                const announcements = JSON.parse(existingAnnouncements);
                await this.saveAnnouncements(announcements);
                console.log(`Migrated ${announcements.length} announcements`);
            }

            console.log('Migration completed successfully');
            return { success: true, message: 'Міграція завершена успішно' };
        } catch (error) {
            console.error('Migration failed:', error);
            return { success: false, message: 'Помилка міграції даних' };
        }
    }

    // ===== BACKUP AND RESTORE =====
    async createBackup() {
        try {
            const users = await this.loadUsers();
            const announcements = await this.loadAnnouncements();
            const config = this.getConfig();

            const backup = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                data: {
                    users,
                    announcements,
                    config
                }
            };

            // Create downloadable backup file
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `uniconnect-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return { success: true, message: 'Резервну копію створено' };
        } catch (error) {
            console.error('Backup creation failed:', error);
            return { success: false, message: 'Помилка створення резервної копії' };
        }
    }
}

// ===== GLOBAL INSTANCE =====
window.dataAPI = new DataAPI();

// ===== EXPORT FOR OTHER SCRIPTS =====
window.DataAPI = DataAPI;