// ===== AUTHENTICATION MANAGER =====
// Handles user registration, login, logout, and session management

class AuthManager {
    constructor() {
        this.users = [];
        this.currentUser = this.loadCurrentUser();
        this.init();
    }

    async init() {
        // Load users from JSON file
        await this.loadUsers();
        
        // Initialize sample data if no users exist
        if (this.users.length === 0) {
            await this.initializeSampleData();
        }
    }

    // ===== DATA MANAGEMENT =====
    async loadUsers() {
        try {
            this.users = await dataAPI.loadUsers();
            return this.users;
        } catch (error) {
            console.error('Error loading users:', error);
            this.users = [];
            return this.users;
        }
    }

    async saveUsers() {
        try {
            const result = await dataAPI.saveUsers(this.users);
            return result;
        } catch (error) {
            console.error('Error saving users:', error);
            return { success: false, message: 'Помилка збереження користувачів' };
        }
    }

    loadCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    saveCurrentUser(user) {
        this.currentUser = user;
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('currentUser');
        }
        NavigationManager.updateNavigation();
    }

    // ===== USER REGISTRATION =====
    async registerUser(userData) {
        try {
            // Validate user data
            const validation = this.validateUserData(userData);
            if (!validation.isValid) {
                throw new Error(validation.errors.join('\n'));
            }

            // Check if user already exists
            const existingUser = this.users.find(user => user.email === userData.email);
            if (existingUser) {
                throw new Error('Користувач з таким email вже існує');
            }

            // Create new user
            const newUser = {
                id: Utils.generateId(),
                ...userData,
                password: this.hashPassword(userData.password),
                createdAt: new Date().toISOString(),
                isActive: true,
                emailVerified: false,
                lastLogin: null
            };

            // Remove confirm password
            delete newUser.confirmPassword;

            // Add to users array
            this.users.push(newUser);
            const saveResult = await this.saveUsers();
            
            if (!saveResult.success) {
                throw new Error(saveResult.message);
            }

            return {
                success: true,
                message: 'Реєстрація успішна! Тепер ви можете увійти в систему.',
                user: this.sanitizeUser(newUser)
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ===== USER LOGIN =====
    async loginUser(email, password, rememberMe = false) {
        try {
            // Find user
            const user = this.users.find(u => u.email === email);
            if (!user) {
                throw new Error('Користувача з таким email не знайдено');
            }

            // Check if user is active
            if (!user.isActive) {
                throw new Error('Акаунт деактивовано. Зверніться до адміністратора.');
            }

            // Verify password
            if (!this.verifyPassword(password, user.password)) {
                throw new Error('Невірний пароль');
            }

            // Update last login
            user.lastLogin = new Date().toISOString();
            await this.saveUsers();

            // Save current user
            const sanitizedUser = this.sanitizeUser(user);
            this.saveCurrentUser(sanitizedUser);

            // Set remember me
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }

            return {
                success: true,
                message: 'Успішний вхід в систему!',
                user: sanitizedUser
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ===== USER LOGOUT =====
    logout() {
        this.saveCurrentUser(null);
        localStorage.removeItem('rememberMe');
        return {
            success: true,
            message: 'Ви успішно вийшли з системи'
        };
    }

    // ===== USER PROFILE MANAGEMENT =====
    async updateUserProfile(userId, updateData) {
        try {
            const userIndex = this.users.findIndex(u => u.id === userId);
            if (userIndex === -1) {
                throw new Error('Користувача не знайдено');
            }

            // Validate update data
            const validation = this.validateProfileUpdate(updateData);
            if (!validation.isValid) {
                throw new Error(validation.errors.join('\n'));
            }

            // Check email uniqueness if email is being changed
            if (updateData.email && updateData.email !== this.users[userIndex].email) {
                const existingUser = this.users.find(u => u.email === updateData.email && u.id !== userId);
                if (existingUser) {
                    throw new Error('Користувач з таким email вже існує');
                }
            }

            // Update user data
            this.users[userIndex] = {
                ...this.users[userIndex],
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            const saveResult = await this.saveUsers();
            
            if (!saveResult.success) {
                throw new Error(saveResult.message);
            }

            // Update current user if it's the same user
            if (this.currentUser && this.currentUser.id === userId) {
                this.saveCurrentUser(this.sanitizeUser(this.users[userIndex]));
            }

            return {
                success: true,
                message: 'Профіль успішно оновлено',
                user: this.sanitizeUser(this.users[userIndex])
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ===== PASSWORD MANAGEMENT =====
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = this.users.find(u => u.id === userId);
            if (!user) {
                throw new Error('Користувача не знайдено');
            }

            // Verify current password
            if (!this.verifyPassword(currentPassword, user.password)) {
                throw new Error('Поточний пароль невірний');
            }

            // Validate new password
            if (newPassword.length < 6) {
                throw new Error('Новий пароль повинен містити мінімум 6 символів');
            }

            // Update password
            user.password = this.hashPassword(newPassword);
            user.updatedAt = new Date().toISOString();
            const saveResult = await this.saveUsers();
            
            if (!saveResult.success) {
                throw new Error(saveResult.message);
            }

            return {
                success: true,
                message: 'Пароль успішно змінено'
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ===== USER MANAGEMENT =====
    getUserById(userId) {
        const user = this.users.find(u => u.id === userId);
        return user ? this.sanitizeUser(user) : null;
    }

    getUserByEmail(email) {
        const user = this.users.find(u => u.email === email);
        return user ? this.sanitizeUser(user) : null;
    }

    getAllUsers() {
        return this.users.map(user => this.sanitizeUser(user));
    }

    getUniversities() {
        ///console.log(this.users)
        return this.users
            .filter(user => user.type === 'university')
            .map(user => this.sanitizeUser(user));
    }

    getCompanies() {
        return this.users
            .filter(user => user.type === 'company')
            .map(user => this.sanitizeUser(user));
    }

    // ===== VALIDATION =====
    validateUserData(userData) {
        const errors = [];

        // Required fields
        const requiredFields = {
            email: 'Email',
            password: 'Пароль',
            confirmPassword: 'Підтвердження пароля',
            type: 'Тип організації'
        };

        Object.keys(requiredFields).forEach(field => {
            if (!userData[field] || !userData[field].toString().trim()) {
                errors.push(`Поле "${requiredFields[field]}" є обов'язковим`);
            }
        });

        // Type-specific required fields
        if (userData.type === 'university') {
            if (!userData.universityName?.trim()) {
                errors.push('Назва університету є обов\'язковою');
            }
            if (!userData.contactPerson?.trim()) {
                errors.push('Контактна особа є обов\'язковою');
            }
        } else if (userData.type === 'company') {
            if (!userData.companyName?.trim()) {
                errors.push('Назва компанії є обов\'язковою');
            }
            if (!userData.industry?.trim()) {
                errors.push('Галузь діяльності є обов\'язковою');
            }
            if (!userData.contactPerson?.trim()) {
                errors.push('Контактна особа є обов\'язковою');
            }
        }

        // Email validation
        if (userData.email && !Utils.isValidEmail(userData.email)) {
            errors.push('Невірний формат email');
        }

        // Password validation
        if (userData.password && userData.password.length < 6) {
            errors.push('Пароль повинен містити мінімум 6 символів');
        }

        // Password confirmation
        if (userData.password !== userData.confirmPassword) {
            errors.push('Паролі не співпадають');
        }

        // Phone validation
        if (userData.phone && !Utils.isValidPhone(userData.phone)) {
            errors.push('Невірний формат телефону');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateProfileUpdate(updateData) {
        const errors = [];

        // Email validation
        if (updateData.email && !Utils.isValidEmail(updateData.email)) {
            errors.push('Невірний формат email');
        }

        // Phone validation
        if (updateData.phone && !Utils.isValidPhone(updateData.phone)) {
            errors.push('Невірний формат телефону');
        }

        // Required fields based on type
        if (updateData.type === 'university' && updateData.universityName !== undefined && !updateData.universityName?.trim()) {
            errors.push('Назва університету не може бути пустою');
        }

        if (updateData.type === 'company' && updateData.companyName !== undefined && !updateData.companyName?.trim()) {
            errors.push('Назва компанії не може бути пустою');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // ===== UTILITY METHODS =====
    hashPassword(password) {
        // Simple hash for demo purposes - in production use proper hashing
        return btoa(password + 'salt123');
    }

    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }

    sanitizeUser(user) {
        const sanitized = { ...user };
        delete sanitized.password;
        return sanitized;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    requireAuth() {
        if (!this.isLoggedIn()) {
            Utils.showNotification('Для доступу до цієї сторінки потрібно увійти в систему', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return false;
        }
        return true;
    }

    // ===== SAMPLE DATA INITIALIZATION =====
    async initializeSampleData() {
        // Sample data is now loaded from JSON files
        // This method is kept for backward compatibility
        console.log('Sample data loaded from JSON files');
        return { success: true, message: 'Зразкові дані завантажено з JSON файлів' };
    }
}

// ===== DATA STORAGE MANAGER =====
class DataManager {
    constructor() {
        this.announcements = [];
        this.init();
    }

    async init() {
        // Load announcements from JSON file
        await this.loadAnnouncements();
        
        // Initialize sample announcements if none exist
        if (this.announcements.length === 0) {
            await this.initializeSampleAnnouncements();
        }
    }

    // ===== ANNOUNCEMENTS MANAGEMENT =====
    async loadAnnouncements() {
        try {
            this.announcements = await dataAPI.loadAnnouncements();
            return this.announcements;
        } catch (error) {
            console.error('Error loading announcements:', error);
            this.announcements = [];
            return this.announcements;
        }
    }

    async saveAnnouncements() {
        try {
            const result = await dataAPI.saveAnnouncements(this.announcements);
            return result;
        } catch (error) {
            console.error('Error saving announcements:', error);
            return { success: false, message: 'Помилка збереження оголошень' };
        }
    }

    async createAnnouncement(announcementData) {
        try {
            const newAnnouncement = {
                id: Utils.generateId(),
                ...announcementData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isActive: true,
                viewCount: 0,
                status: 'active'
            };

            this.announcements.push(newAnnouncement);
            const saveResult = await this.saveAnnouncements();
            
            if (!saveResult.success) {
                throw new Error(saveResult.message);
            }

            return {
                success: true,
                message: 'Оголошення успішно створено',
                announcement: newAnnouncement
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async updateAnnouncement(id, updateData) {
        try {
            const index = this.announcements.findIndex(a => a.id === id);
            if (index === -1) {
                return {
                    success: false,
                    message: 'Оголошення не знайдено'
                };
            }

            this.announcements[index] = {
                ...this.announcements[index],
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            const saveResult = await this.saveAnnouncements();
            
            if (!saveResult.success) {
                throw new Error(saveResult.message);
            }

            return {
                success: true,
                message: 'Оголошення успішно оновлено',
                announcement: this.announcements[index]
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async deleteAnnouncement(id) {
        try {
            const index = this.announcements.findIndex(a => a.id === id);
            if (index === -1) {
                return {
                    success: false,
                    message: 'Оголошення не знайдено'
                };
            }

            this.announcements.splice(index, 1);
            const saveResult = await this.saveAnnouncements();
            
            if (!saveResult.success) {
                throw new Error(saveResult.message);
            }

            return {
                success: true,
                message: 'Оголошення успішно видалено'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async getAnnouncementById(id) {
        const announcement = this.announcements.find(a => a.id === id);
        if (announcement) {
            // Increment view count
            announcement.viewCount = (announcement.viewCount || 0) + 1;
            await this.saveAnnouncements();
        }
        return announcement;
    }

    getAllAnnouncements() {
        return this.announcements.filter(a => a.isActive);
    }

    getAnnouncementsByUser(userId) {
        return this.announcements.filter(a => a.authorId === userId);
    }

    getActiveAnnouncements() {
        const now = new Date();
        return this.announcements.filter(a => {
            if (!a.isActive) return false;
            if (a.expiryDate && new Date(a.expiryDate) < now) return false;
            return true;
        });
    }

    // ===== STATISTICS =====
    getStatistics() {
        const authManager = window.authManager;
        //console.log(this)
        //console.log(authManager)
        
        const totalAnnouncements = this.announcements.length;
        const activeAnnouncements = this.getActiveAnnouncements().length;
        const totalUniversities = authManager.getUniversities().length;
        const totalCompanies = authManager.getCompanies().length;
        
        const today = new Date().toDateString();
        const todayAnnouncements = this.announcements.filter(a => 
            new Date(a.createdAt).toDateString() === today
        ).length;

        return {
            totalAnnouncements,
            activeAnnouncements,
            totalUniversities,
            totalCompanies,
            todayAnnouncements
        };
    }

    // ===== SAMPLE DATA =====
    async initializeSampleAnnouncements() {
        // Sample data is now loaded from JSON files
        // This method is kept for backward compatibility
        console.log('Sample announcements loaded from JSON files');
        return { success: true, message: 'Зразкові оголошення завантажено з JSON файлів' };
    }
}

// ===== GLOBAL INSTANCES =====
// Initialize managers after DataAPI is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for DataAPI to initialize
    if (window.dataAPI) {
        await window.dataAPI.init();
    }
    
    // Initialize managers
    window.authManager = new AuthManager();
    window.dataManager = new DataManager();
    
    // Wait for managers to initialize
    await window.authManager.init();
    await window.dataManager.init();
});

// ===== EXPORT FOR OTHER SCRIPTS =====
window.AuthManager = AuthManager;
window.DataManager = DataManager;