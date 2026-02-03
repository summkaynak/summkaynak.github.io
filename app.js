// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB4QHRHk4tQWqRHkGJkD6vRqzibxwjHDaQ",
    authDomain: "kaynak-cf02a.firebaseapp.com",
    projectId: "kaynak-cf02a",
    storageBucket: "kaynak-cf02a.firebasestorage.app",
    messagingSenderId: "1034754005815",
    appId: "1:1034754005815:web:6e5fe8c70fc5495b1218b2",
    measurementId: "G-1CD0S6V0DL"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Global variables
let currentUser = null;
let requests = [];
let operators = [];
let currentFilter = 'all';
let allCurrentFilter = 'all';

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Yüklendi");
    
    // Set current year
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    // Setup auth tabs
    setupAuthTabs();
    
    // Setup form submissions
    setupAuthForms();
    
    // Setup Google buttons
    setupGoogleButtons();
    
    // Close modals when clicking X
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAllModals();
            }
        });
    });
    
    // Initialize auth state listener
    initAuth();
});

// Setup auth tabs switching
function setupAuthTabs() {
    const loginTabBtn = document.getElementById('login-tab-btn');
    const registerTabBtn = document.getElementById('register-tab-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginTabBtn && registerTabBtn) {
        loginTabBtn.addEventListener('click', function() {
            loginTabBtn.classList.add('active');
            registerTabBtn.classList.remove('active');
            if (loginForm) loginForm.classList.add('active');
            if (registerForm) registerForm.classList.remove('active');
            clearAuthMessages();
        });
        
        registerTabBtn.addEventListener('click', function() {
            registerTabBtn.classList.add('active');
            loginTabBtn.classList.remove('active');
            if (registerForm) registerForm.classList.add('active');
            if (loginForm) loginForm.classList.remove('active');
            clearAuthMessages();
        });
    }
}

// Setup auth forms
function setupAuthForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegister();
        });
    }
}

// Setup Google buttons
function setupGoogleButtons() {
    const googleLoginBtn = document.getElementById('google-login');
    const googleRegisterBtn = document.getElementById('google-register');
    
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', function() {
            handleGoogleLogin();
        });
    }
    
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', function() {
            handleGoogleLogin();
        });
    }
}

// Initialize authentication
function initAuth() {
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            currentUser = user;
            console.log("Kullanıcı giriş yaptı:", user.email);
            showApp();
            loadAllData();
        } else {
            // User is signed out
            currentUser = null;
            showAuth();
        }
    });
}

// Show authentication screen
function showAuth() {
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    
    if (authContainer) authContainer.style.display = 'flex';
    if (appContainer) appContainer.style.display = 'none';
    
    // Clear forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) loginForm.reset();
    if (registerForm) registerForm.reset();
    
    // Clear messages
    clearAuthMessages();
    
    // Switch to login tab
    const loginTabBtn = document.getElementById('login-tab-btn');
    const registerTabBtn = document.getElementById('register-tab-btn');
    const loginFormEl = document.getElementById('login-form');
    const registerFormEl = document.getElementById('register-form');
    
    if (loginTabBtn && registerTabBtn && loginFormEl && registerFormEl) {
        loginTabBtn.classList.add('active');
        registerTabBtn.classList.remove('active');
        loginFormEl.classList.add('active');
        registerFormEl.classList.remove('active');
    }
}

// Show application
function showApp() {
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    
    if (authContainer) authContainer.style.display = 'none';
    if (appContainer) appContainer.style.display = 'block';
    
    // Update user info
    if (currentUser) {
        const userName = currentUser.displayName || currentUser.email.split('@')[0];
        const userEmail = currentUser.email;
        const userNameElement = document.getElementById('user-name');
        const userRoleElement = document.getElementById('user-role');
        const userNameDropdown = document.getElementById('user-dropdown-name');
        const userEmailDropdown = document.getElementById('user-dropdown-email');
        
        if (userNameElement) userNameElement.textContent = userName;
        if (userRoleElement) userRoleElement.textContent = "Operatör";
        if (userNameDropdown) userNameDropdown.textContent = userName;
        if (userEmailDropdown) userEmailDropdown.textContent = userEmail;
        
        // Update avatar
        updateUserAvatar(userName);
    }
    
    // Setup main app event listeners
    setupAppEventListeners();
    
    // Update date/time
    updateDateTime();
    setInterval(updateDateTime, 60000);
}

// Update user avatar
function updateUserAvatar(userName) {
    const avatarElement = document.getElementById('user-avatar');
    const dropdownAvatar = document.getElementById('user-dropdown-avatar');
    
    if (avatarElement) {
        if (currentUser.photoURL) {
            avatarElement.innerHTML = `<img src="${currentUser.photoURL}" alt="${userName}">`;
        } else {
            const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
            avatarElement.innerHTML = `<span>${initials.substring(0, 2)}</span>`;
        }
    }
    
    if (dropdownAvatar) {
        if (currentUser.photoURL) {
            dropdownAvatar.innerHTML = `<img src="${currentUser.photoURL}" alt="${userName}">`;
        } else {
            const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
            dropdownAvatar.innerHTML = `<span>${initials.substring(0, 2)}</span>`;
        }
    }
}

// Load all data from Firestore
async function loadAllData() {
    try {
        await Promise.all([
            loadRequestsFromFirestore(),
            loadOperatorsFromFirestore()
        ]);
        
        // Update stats
        updateStats();
        updateCharts();
        
    } catch (error) {
        console.error('Error loading data:', error);
        // Use sample data if Firestore fails
        loadSampleData();
    }
}

// Load requests from Firestore
async function loadRequestsFromFirestore() {
    try {
        const querySnapshot = await db.collection('requests')
            .orderBy('createdAt', 'desc')
            .get();
        
        requests = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            requests.push({
                id: doc.id,
                ...data
            });
        });
        
        updateRequestsList();
        updateAllRequestsList();
        
    } catch (error) {
        console.error('Error loading requests:', error);
        throw error;
    }
}

// Load operators from Firestore
async function loadOperatorsFromFirestore() {
    try {
        const querySnapshot = await db.collection('operators')
            .orderBy('name')
            .get();
        
        operators = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            operators.push({
                id: doc.id,
                ...data
            });
        });
        
        updateOperatorsList();
        
    } catch (error) {
        console.error('Error loading operators:', error);
        throw error;
    }
}

// Load sample data
function loadSampleData() {
    requests = [
        {
            id: '1',
            requestNumber: 1001,
            unit: "Üretim",
            date: new Date().toISOString().split('T')[0],
            description: "Kaynak makinesi contası değişimi",
            status: "new",
            operator: "",
            estimatedDays: 2,
            actualDays: null,
            startDate: null,
            completionDate: null,
            urgency: "yüksek",
            createdBy: "ahmet.yilmaz@firma.com",
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            requestNumber: 1002,
            unit: "Kalite",
            date: new Date().toISOString().split('T')[0],
            description: "Ölçüm aleti kalibrasyonu",
            status: "assigned",
            operator: "Ahmet Yılmaz",
            estimatedDays: 3,
            actualDays: null,
            startDate: new Date().toISOString().split('T')[0],
            completionDate: null,
            urgency: "normal",
            createdBy: "mehmet.demir@firma.com",
            createdAt: new Date().toISOString()
        }
    ];
    
    operators = [
        {
            id: '1',
            name: "Ahmet Yılmaz",
            email: "ahmet.yilmaz@firma.com",
            phone: "0532 123 45 67",
            specialty: "Kaynak",
            experience: 5,
            status: "aktif",
            notes: "Kaynak uzmanı"
        },
        {
            id: '2',
            name: "Mehmet Demir",
            email: "mehmet.demir@firma.com",
            phone: "0533 234 56 78",
            specialty: "Talaşlı İmalat",
            experience: 3,
            status: "aktif",
            notes: "CNC operatörü"
        }
    ];
    
    updateRequestsList();
    updateAllRequestsList();
    updateOperatorsList();
    updateStats();
    updateCharts();
}

// Update requests list (for dashboard)
function updateRequestsList() {
    const tbody = document.getElementById('requests-list');
    const dashboardEmpty = document.getElementById('dashboard-empty');
    const requestsTable = document.getElementById('requests-table');
    const statusFilter = document.getElementById('status-filter');
    const unitFilter = document.getElementById('unit-filter');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Get filter values
    const statusFilterValue = statusFilter ? statusFilter.value : 'all';
    const unitFilterValue = unitFilter ? unitFilter.value : 'all';
    
    // Filter requests
    let filteredRequests = requests;
    
    if (statusFilterValue !== 'all') {
        filteredRequests = filteredRequests.filter(req => req.status === statusFilterValue);
    }
    
    if (unitFilterValue !== 'all') {
        filteredRequests = filteredRequests.filter(req => req.unit === unitFilterValue);
    }
    
    // Check if there are any requests
    if (filteredRequests.length === 0) {
        if (dashboardEmpty) dashboardEmpty.style.display = 'block';
        if (requestsTable) requestsTable.style.display = 'none';
        return;
    }
    
    if (dashboardEmpty) dashboardEmpty.style.display = 'none';
    if (requestsTable) requestsTable.style.display = 'table';
    
    // Sort by date (newest first)
    const sortedRequests = [...filteredRequests]
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 20); // Limit to 20 for performance
    
    sortedRequests.forEach(request => {
        const status = getStatusInfo(request.status);
        const row = document.createElement('tr');
        
        // Get action buttons based on status
        const actionButtons = getActionButtons(request);
        
        row.innerHTML = `
            <td>${request.requestNumber || request.id}</td>
            <td>${request.unit}</td>
            <td>${formatDate(request.date)}</td>
            <td>${request.description} ${request.urgency === 'acil' ? '<span class="urgent-badge">ACİL</span>' : ''}</td>
            <td><span class="status ${status.class}">${status.text}</span></td>
            <td>${request.operator || "-"}</td>
            <td>${request.estimatedDays}</td>
            <td>
                <div class="action-buttons">
                    ${actionButtons}
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Get action buttons based on request status
function getActionButtons(request) {
    let buttons = '';
    
    // Edit button for all statuses
    buttons += `
        <button class="btn btn-primary btn-sm" onclick="editRequest('${request.id}')" title="Düzenle">
            <i class="fas fa-edit"></i>
        </button>
    `;
    
    // Status-specific buttons
    switch(request.status) {
        case 'new':
            buttons += `
                <button class="btn btn-success btn-sm" onclick="assignRequest('${request.id}')" title="Operatöre Ata">
                    <i class="fas fa-user-plus"></i>
                </button>
            `;
            break;
            
        case 'assigned':
            buttons += `
                <button class="btn btn-info btn-sm" onclick="startRequest('${request.id}')" title="İşi Başlat">
                    <i class="fas fa-play"></i>
                </button>
            `;
            break;
            
        case 'inprogress':
            buttons += `
                <button class="btn btn-warning btn-sm" onclick="completeRequest('${request.id}')" title="İşi Tamamla">
                    <i class="fas fa-check-circle"></i>
                </button>
            `;
            break;
            
        case 'completed':
            buttons += `
                <button class="btn btn-secondary btn-sm" onclick="reopenRequest('${request.id}')" title="İşi Geri Aç">
                    <i class="fas fa-redo"></i>
                </button>
            `;
            break;
    }
    
    return buttons;
}

// Update all requests list
function updateAllRequestsList() {
    const tbody = document.getElementById('all-requests-list');
    const emptyStateElement = document.getElementById('all-requests-empty');
    const tableElement = document.getElementById('all-requests-table');
    const statusFilter = document.getElementById('all-status-filter');
    const unitFilter = document.getElementById('all-unit-filter');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Get filter values
    const statusFilterValue = statusFilter ? statusFilter.value : 'all';
    const unitFilterValue = unitFilter ? unitFilter.value : 'all';
    
    // Filter requests
    let filteredRequests = requests;
    
    if (statusFilterValue !== 'all') {
        filteredRequests = filteredRequests.filter(req => req.status === statusFilterValue);
    }
    
    if (unitFilterValue !== 'all') {
        filteredRequests = filteredRequests.filter(req => req.unit === unitFilterValue);
    }
    
    // Check if there are any requests
    if (filteredRequests.length === 0) {
        if (emptyStateElement) emptyStateElement.style.display = 'block';
        if (tableElement) tableElement.style.display = 'none';
        return;
    }
    
    if (emptyStateElement) emptyStateElement.style.display = 'none';
    if (tableElement) tableElement.style.display = 'table';
    
    // Sort by date (newest first)
    const sortedRequests = [...filteredRequests].sort((a, b) => 
        new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
    );
    
    sortedRequests.forEach(request => {
        const status = getStatusInfo(request.status);
        const row = document.createElement('tr');
        
        // Format days info
        let daysInfo = `${request.estimatedDays || 0}`;
        if (request.status === 'completed' && request.actualDays) {
            daysInfo = `${request.actualDays} / ${request.estimatedDays || 0}`;
        }
        
        // Get action buttons
        const actionButtons = getActionButtons(request);
        
        row.innerHTML = `
            <td>${request.requestNumber || request.id}</td>
            <td>${request.unit}</td>
            <td>${formatDate(request.date)}</td>
            <td>${request.description} ${request.urgency === 'acil' ? '<span class="urgent-badge">ACİL</span>' : ''}</td>
            <td><span class="status ${status.class}">${status.text}</span></td>
            <td>${request.operator || "-"}</td>
            <td>${request.createdBy || currentUser.email}</td>
            <td>${daysInfo}</td>
            <td>
                <div class="action-buttons">
                    ${actionButtons}
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Update operators list
function updateOperatorsList() {
    const operatorsList = document.getElementById('operators-list');
    const operatorsEmpty = document.getElementById('operators-empty');
    
    if (!operatorsList) return;
    
    operatorsList.innerHTML = '';
    
    // Check if there are any operators
    if (operators.length === 0) {
        if (operatorsEmpty) operatorsEmpty.style.display = 'block';
        if (operatorsList) operatorsList.style.display = 'none';
        return;
    }
    
    if (operatorsEmpty) operatorsEmpty.style.display = 'none';
    if (operatorsList) operatorsList.style.display = 'block';
    
    operators.forEach(operator => {
        const operatorCard = document.createElement('div');
        operatorCard.className = 'operator-card';
        
        // Get operator statistics
        const totalJobs = getOperatorJobCount(operator.name);
        const completedJobs = getOperatorCompletedJobs(operator.name);
        const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;
        
        operatorCard.innerHTML = `
            <div class="operator-info">
                <h4>${operator.name}</h4>
                <p><i class="fas fa-briefcase"></i> ${operator.specialty} | <i class="fas fa-star"></i> ${operator.experience || 0} yıl deneyim</p>
                <p><i class="fas fa-envelope"></i> ${operator.email || 'E-posta yok'} | <i class="fas fa-phone"></i> ${operator.phone || 'Telefon yok'}</p>
                <div class="operator-stats">
                    <div class="operator-stat">
                        <div class="operator-stat-value">${totalJobs}</div>
                        <div class="operator-stat-label">Toplam İş</div>
                    </div>
                    <div class="operator-stat">
                        <div class="operator-stat-value">${completedJobs}</div>
                        <div class="operator-stat-label">Tamamlanan</div>
                    </div>
                    <div class="operator-stat">
                        <div class="operator-stat-value">${completionRate}%</div>
                        <div class="operator-stat-label">Başarı</div>
                    </div>
                </div>
            </div>
            <div class="action-buttons">
                <span class="operator-status ${operator.status === 'aktif' ? 'operator-active' : 'operator-inactive'}">
                    ${operator.status === 'aktif' ? 'Aktif' : 'Pasif'}
                </span>
                <button class="btn btn-warning btn-sm" onclick="editOperator('${operator.id}')">
                    <i class="fas fa-edit"></i> Düzenle
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteOperator('${operator.id}', '${operator.name}')">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        `;
        
        operatorsList.appendChild(operatorCard);
    });
}

// Get operator job count
function getOperatorJobCount(operatorName) {
    return requests.filter(req => req.operator === operatorName).length;
}

// Get operator completed jobs count
function getOperatorCompletedJobs(operatorName) {
    return requests.filter(req => req.operator === operatorName && req.status === 'completed').length;
}

// Get status info
function getStatusInfo(status) {
    const statusMap = {
        "new": { text: "Yeni Talep", class: "status-new" },
        "assigned": { text: "Operatör Atandı", class: "status-assigned" },
        "inprogress": { text: "Devam Ediyor", class: "status-inprogress" },
        "completed": { text: "Tamamlandı", class: "status-completed" }
    };
    
    return statusMap[status] || statusMap['new'];
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return '-';
    
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR');
    } catch (e) {
        return dateStr;
    }
}

// Update statistics
function updateStats() {
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(req => req.status === 'new').length;
    const assignedRequests = requests.filter(req => req.status === 'assigned').length;
    const inprogressRequests = requests.filter(req => req.status === 'inprogress').length;
    const completedRequests = requests.filter(req => req.status === 'completed').length;
    const activeOperators = operators.filter(op => op.status === 'aktif').length;
    
    // Calculate average completion time
    const completedTasks = requests.filter(req => req.status === 'completed');
    const avgCompletionTime = completedTasks.length > 0 
        ? (completedTasks.reduce((sum, req) => sum + (req.actualDays || 0), 0) / completedTasks.length).toFixed(1)
        : "0.0";
    
    const totalRequestsElement = document.getElementById('total-requests');
    const pendingRequestsElement = document.getElementById('pending-requests');
    const inprogressRequestsElement = document.getElementById('inprogress-requests');
    const completedTasksElement = document.getElementById('completed-tasks');
    const totalOperatorsElement = document.getElementById('total-operators');
    const avgCompletionTimeElement = document.getElementById('avg-completion-time');
    
    if (totalRequestsElement) totalRequestsElement.textContent = totalRequests;
    if (pendingRequestsElement) pendingRequestsElement.textContent = pendingRequests;
    if (inprogressRequestsElement) inprogressRequestsElement.textContent = inprogressRequests;
    if (completedTasksElement) completedTasksElement.textContent = completedRequests;
    if (totalOperatorsElement) totalOperatorsElement.textContent = activeOperators;
    if (avgCompletionTimeElement) avgCompletionTimeElement.textContent = avgCompletionTime;
    
    // Update stats page
    const statsTotalJobs = document.getElementById('stats-total-jobs');
    const statsCompletionRate = document.getElementById('stats-completion-rate');
    const statsDelayedJobs = document.getElementById('stats-delayed-jobs');
    const statsTopOperator = document.getElementById('stats-top-operator');
    
    if (statsTotalJobs) statsTotalJobs.textContent = totalRequests;
    if (statsCompletionRate) statsCompletionRate.textContent = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) + '%' : '0%';
    
    // Calculate delayed jobs
    const today = new Date();
    const delayedJobs = requests.filter(req => {
        if (req.status !== 'completed' && req.estimatedDays && req.startDate) {
            const startDate = new Date(req.startDate);
            const expectedDate = new Date(startDate);
            expectedDate.setDate(expectedDate.getDate() + req.estimatedDays);
            return expectedDate < today;
        }
        return false;
    }).length;
    
    if (statsDelayedJobs) statsDelayedJobs.textContent = delayedJobs;
    
    // Find top operator
    const operatorStats = {};
    completedTasks.forEach(req => {
        if (req.operator) {
            operatorStats[req.operator] = (operatorStats[req.operator] || 0) + 1;
        }
    });
    
    let topOperator = '-';
    let maxJobs = 0;
    for (const [operator, count] of Object.entries(operatorStats)) {
        if (count > maxJobs) {
            maxJobs = count;
            topOperator = operator;
        }
    }
    
    if (statsTopOperator) statsTopOperator.textContent = topOperator;
    
    // Update operator performance
    updateOperatorPerformance();
    
    // Update recent completed
    updateRecentCompleted();
}

// Update charts
function updateCharts() {
    updateStatusChart();
}

// Update status chart
function updateStatusChart() {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;
    
    const statusCounts = {
        'new': requests.filter(req => req.status === 'new').length,
        'assigned': requests.filter(req => req.status === 'assigned').length,
        'inprogress': requests.filter(req => req.status === 'inprogress').length,
        'completed': requests.filter(req => req.status === 'completed').length
    };
    
    // Destroy existing chart if it exists
    if (window.statusChartInstance) {
        window.statusChartInstance.destroy();
    }
    
    window.statusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Yeni Talepler', 'Atanmış İşler', 'Devam Eden İşler', 'Tamamlanan İşler'],
            datasets: [{
                data: [statusCounts.new, statusCounts.assigned, statusCounts.inprogress, statusCounts.completed],
                backgroundColor: [
                    '#1976d2', // status-new
                    '#f57c00', // status-assigned
                    '#388e3c', // status-inprogress
                    '#689f38'  // status-completed
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}

// Update operator performance
function updateOperatorPerformance() {
    const container = document.getElementById('operator-performance');
    if (!container) return;
    
    // Calculate operator performance
    const operatorPerformance = {};
    
    operators.forEach(operator => {
        if (operator.status === 'aktif') {
            const totalJobs = getOperatorJobCount(operator.name);
            const completedJobs = getOperatorCompletedJobs(operator.name);
            const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;
            
            operatorPerformance[operator.name] = {
                totalJobs,
                completedJobs,
                completionRate
            };
        }
    });
    
    // Sort by completion rate
    const sortedOperators = Object.entries(operatorPerformance)
        .sort(([, a], [, b]) => b.completionRate - a.completionRate)
        .slice(0, 5); // Top 5
    
    let html = '';
    sortedOperators.forEach(([name, stats]) => {
        html += `
            <div class="operator-performance-item">
                <div style="flex-grow: 1;">
                    <div style="font-weight: 600; color: #333;">${name}</div>
                    <div style="font-size: 0.85rem; color: #666;">
                        ${stats.completedJobs}/${stats.totalJobs} iş (%${stats.completionRate})
                    </div>
                </div>
                <div class="operator-performance-bar">
                    <div class="operator-performance-fill" style="width: ${stats.completionRate}%"></div>
                </div>
            </div>
        `;
    });
    
    if (html === '') {
        html = '<div style="color: #666; text-align: center; padding: 20px;">Henüz performans verisi bulunmuyor.</div>';
    }
    
    container.innerHTML = html;
}

// Update recent completed
function updateRecentCompleted() {
    const container = document.getElementById('recent-completed');
    if (!container) return;
    
    // Get recent completed requests (last 5)
    const recentCompleted = requests
        .filter(req => req.status === 'completed')
        .sort((a, b) => new Date(b.completionDate || b.updatedAt || b.createdAt) - new Date(a.completionDate || a.updatedAt || a.createdAt))
        .slice(0, 5);
    
    let html = '';
    recentCompleted.forEach(request => {
        const completionDate = request.completionDate ? formatDate(request.completionDate) : formatDate(request.updatedAt);
        html += `
            <div class="recent-item">
                <div class="recent-item-header">
                    <div class="recent-item-title">Talep #${request.requestNumber || request.id}</div>
                    <div class="recent-item-date">${completionDate}</div>
                </div>
                <div class="recent-item-desc">${request.description.substring(0, 50)}${request.description.length > 50 ? '...' : ''}</div>
                <div style="font-size: 0.8rem; color: #888; margin-top: 3px;">
                    Operatör: ${request.operator || '-'} | Süre: ${request.actualDays || 0} gün
                </div>
            </div>
        `;
    });
    
    if (html === '') {
        html = '<div style="color: #666; text-align: center; padding: 20px;">Henüz tamamlanan iş bulunmuyor.</div>';
    }
    
    container.innerHTML = html;
}

// Clear auth messages
function clearAuthMessages() {
    const errorElement = document.getElementById('auth-error');
    const successElement = document.getElementById('auth-success');
    
    if (errorElement) errorElement.style.display = 'none';
    if (successElement) successElement.style.display = 'none';
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('auth-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

// Show success message
function showSuccess(message) {
    const successElement = document.getElementById('auth-success');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    }
}

// Handle login
async function handleLogin() {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    
    if (!emailInput || !passwordInput) {
        showError('Form elemanları yüklenemedi.');
        return;
    }
    
    const email = emailInput.value;
    const password = passwordInput.value;
    
    if (!email || !password) {
        showError('Lütfen tüm alanları doldurun.');
        return;
    }
    
    try {
        // Show loading
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span>Giriş Yapılıyor...</span>';
        }
        
        await auth.signInWithEmailAndPassword(email, password);
        
        showSuccess('Giriş başarılı!');
        
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'Giriş yapılırken bir hata oluştu.';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Hatalı parola.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Geçersiz e-posta adresi.';
        } else if (error.code === 'auth/user-disabled') {
            errorMessage = 'Bu hesap devre dışı bırakılmış.';
        }
        
        showError(errorMessage);
    } finally {
        // Reset button
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<span>Giriş Yap</span>';
        }
    }
}

// Handle register
async function handleRegister() {
    const nameInput = document.getElementById('register-name');
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const passwordConfirmInput = document.getElementById('register-password-confirm');
    
    if (!nameInput || !emailInput || !passwordInput || !passwordConfirmInput) {
        showError('Form elemanları yüklenemedi.');
        return;
    }
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;
    
    // Validation
    if (!name || !email || !password || !passwordConfirm) {
        showError('Lütfen tüm alanları doldurun.');
        return;
    }
    
    if (name.length < 2) {
        showError('Adınız en az 2 karakter olmalıdır.');
        return;
    }
    
    if (password !== passwordConfirm) {
        showError('Parolalar eşleşmiyor.');
        return;
    }
    
    if (password.length < 6) {
        showError('Parola en az 6 karakter olmalıdır.');
        return;
    }
    
    try {
        // Show loading
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.disabled = true;
            registerBtn.innerHTML = '<span>Kayıt Yapılıyor...</span>';
        }
        
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Update display name
        await userCredential.user.updateProfile({
            displayName: name
        });
        
        showSuccess('Kayıt başarılı! Giriş yapabilirsiniz.');
        
        // Switch to login tab
        const loginTabBtn = document.getElementById('login-tab-btn');
        const registerTabBtn = document.getElementById('register-tab-btn');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginTabBtn && registerTabBtn && loginForm && registerForm) {
            loginTabBtn.classList.add('active');
            registerTabBtn.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        }
        
        // Fill email in login form
        const loginEmailInput = document.getElementById('login-email');
        if (loginEmailInput) loginEmailInput.value = email;
        
        // Clear password fields
        passwordInput.value = '';
        passwordConfirmInput.value = '';
        
    } catch (error) {
        console.error('Register error:', error);
        
        let errorMessage = 'Kayıt olurken bir hata oluştu.';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Bu e-posta adresi zaten kullanımda.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Geçersiz e-posta adresi.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Parola çok zayıf. Daha güçlü bir parola seçin.';
        } else if (error.code === 'auth/operation-not-allowed') {
            errorMessage = 'E-posta/parola ile kayıt devre dışı bırakılmış.';
        }
        
        showError(errorMessage);
    } finally {
        // Reset button
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.disabled = false;
            registerBtn.innerHTML = '<span>Kayıt Ol</span>';
        }
    }
}

// Handle Google login
async function handleGoogleLogin() {
    try {
        // Show loading
        const googleLoginBtn = document.getElementById('google-login');
        const googleRegisterBtn = document.getElementById('google-register');
        
        if (googleLoginBtn) {
            googleLoginBtn.disabled = true;
            googleLoginBtn.innerHTML = '<i class="fab fa-google"></i> Giriş Yapılıyor...';
        }
        
        if (googleRegisterBtn) {
            googleRegisterBtn.disabled = true;
            googleRegisterBtn.innerHTML = '<i class="fab fa-google"></i> Kayıt Yapılıyor...';
        }
        
        await auth.signInWithPopup(googleProvider);
        
        showSuccess('Google ile giriş başarılı!');
        
    } catch (error) {
        console.error('Google login error:', error);
        
        let errorMessage = 'Google ile giriş yapılırken bir hata oluştu.';
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Giriş penceresi kapatıldı.';
        } else if (error.code === 'auth/unauthorized-domain') {
            errorMessage = 'Bu domain için yetkilendirme yapılmamış.';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Popup engellendi. Lütfen tarayıcınızın popup ayarlarını kontrol edin.';
        }
        
        showError(errorMessage);
    } finally {
        // Reset buttons
        const googleLoginBtn = document.getElementById('google-login');
        const googleRegisterBtn = document.getElementById('google-register');
        
        if (googleLoginBtn) {
            googleLoginBtn.disabled = false;
            googleLoginBtn.innerHTML = '<i class="fab fa-google"></i> Google ile Giriş Yap';
        }
        
        if (googleRegisterBtn) {
            googleRegisterBtn.disabled = false;
            googleRegisterBtn.innerHTML = '<i class="fab fa-google"></i> Google ile Kayıt Ol';
        }
    }
}

// Setup main app event listeners
function setupAppEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // User profile dropdown
    const userProfile = document.getElementById('user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = document.getElementById('user-dropdown');
            if (dropdown) {
                dropdown.classList.toggle('active');
            }
        });
    }
    
    // Menu navigation
    const menuDashboard = document.getElementById('menu-dashboard');
    const menuRequests = document.getElementById('menu-requests');
    const menuOperators = document.getElementById('menu-operators');
    const menuStats = document.getElementById('menu-stats');
    
    if (menuDashboard) menuDashboard.addEventListener('click', function(e) {
        e.preventDefault();
        showDashboard();
    });
    
    if (menuRequests) menuRequests.addEventListener('click', function(e) {
        e.preventDefault();
        showAllRequests();
    });
    
    if (menuOperators) menuOperators.addEventListener('click', function(e) {
        e.preventDefault();
        showOperators();
    });
    
    if (menuStats) menuStats.addEventListener('click', function(e) {
        e.preventDefault();
        showStats();
    });
    
    // Add request buttons
    const addRequestBtn = document.getElementById('add-request-btn');
    const addRequestBtn2 = document.getElementById('add-request-btn-2');
    
    if (addRequestBtn) addRequestBtn.addEventListener('click', openAddRequestModal);
    if (addRequestBtn2) addRequestBtn2.addEventListener('click', openAddRequestModal);
    
    // Add operator button
    const addOperatorBtn = document.getElementById('add-operator-btn');
    if (addOperatorBtn) addOperatorBtn.addEventListener('click', openAddOperatorModal);
    
    // Request form submit
    const requestForm = document.getElementById('request-form');
    if (requestForm) {
        requestForm.addEventListener('submit', handleRequestSubmit);
    }
    
    // Operator form submit
    const operatorForm = document.getElementById('operator-form');
    if (operatorForm) {
        operatorForm.addEventListener('submit', handleOperatorSubmit);
    }
    
    // Profile form submit
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Filter events
    const statusFilter = document.getElementById('status-filter');
    const unitFilter = document.getElementById('unit-filter');
    const allStatusFilter = document.getElementById('all-status-filter');
    const allUnitFilter = document.getElementById('all-unit-filter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', updateRequestsList);
    }
    
    if (unitFilter) {
        unitFilter.addEventListener('change', updateRequestsList);
    }
    
    if (allStatusFilter) {
        allStatusFilter.addEventListener('change', updateAllRequestsList);
    }
    
    if (allUnitFilter) {
        allUnitFilter.addEventListener('change', updateAllRequestsList);
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    });
    
    // Profile edit button
    const profileEditBtn = document.getElementById('profile-edit-btn');
    if (profileEditBtn) {
        profileEditBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openEditProfileModal();
        });
    }
}

// Handle logout
async function handleLogout() {
    try {
        await auth.signOut();
        showSuccess('Çıkış yapıldı.');
    } catch (error) {
        console.error('Logout error:', error);
        showError('Çıkış yapılırken bir hata oluştu.');
    }
}

// Update date and time
function updateDateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.innerHTML = `
            <div>${dateStr}</div>
            <div>${timeStr}</div>
        `;
    }
}

// Menu navigation functions
function showDashboard() {
    setActiveMenu('menu-dashboard');
    showContentSection('dashboard-content');
}

function showAllRequests() {
    setActiveMenu('menu-requests');
    showContentSection('requests-content');
}

function showOperators() {
    setActiveMenu('menu-operators');
    showContentSection('operators-content');
}

function showStats() {
    setActiveMenu('menu-stats');
    showContentSection('stats-content');
}

function setActiveMenu(menuId) {
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item a').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked menu item
    const menuItem = document.getElementById(menuId);
    if (menuItem) {
        menuItem.classList.add('active');
    }
}

function showContentSection(sectionId) {
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
}

// Modal functions
function openAddRequestModal() {
    const requestModal = document.getElementById('request-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalSubmitBtn = document.getElementById('modal-submit-btn');
    const requestForm = document.getElementById('request-form');
    
    if (modalTitle) modalTitle.textContent = 'Yeni Talep Ekle';
    if (modalSubmitBtn) modalSubmitBtn.textContent = 'Talep Ekle';
    if (requestForm) requestForm.reset();
    
    // Clear stored request ID
    delete window.currentRequestId;
    
    if (requestModal) {
        requestModal.style.display = 'flex';
    }
}

function openAddOperatorModal() {
    const operatorModal = document.getElementById('operator-modal');
    const modalTitle = document.getElementById('operator-modal-title');
    const modalSubmitBtn = document.getElementById('operator-modal-submit-btn');
    const operatorForm = document.getElementById('operator-form');
    
    if (modalTitle) modalTitle.textContent = 'Yeni Operatör Ekle';
    if (modalSubmitBtn) modalSubmitBtn.textContent = 'Operatör Ekle';
    if (operatorForm) operatorForm.reset();
    
    // Clear stored operator ID
    delete window.currentOperatorId;
    
    if (operatorModal) {
        operatorModal.style.display = 'flex';
    }
}

// Open edit profile modal
function openEditProfileModal() {
    const profileModal = document.getElementById('profile-modal');
    const profileNameInput = document.getElementById('profile-name');
    const profileEmailInput = document.getElementById('profile-email');
    
    if (profileNameInput && currentUser) {
        profileNameInput.value = currentUser.displayName || '';
    }
    
    if (profileEmailInput && currentUser) {
        profileEmailInput.value = currentUser.email || '';
    }
    
    if (profileModal) {
        profileModal.style.display = 'flex';
    }
}

// Edit operator function
async function editOperator(operatorId) {
    const operator = operators.find(op => op.id === operatorId);
    if (!operator) return;
    
    const operatorModal = document.getElementById('operator-modal');
    const modalTitle = document.getElementById('operator-modal-title');
    const modalSubmitBtn = document.getElementById('operator-modal-submit-btn');
    const operatorName = document.getElementById('operator-name');
    const operatorEmail = document.getElementById('operator-email');
    const operatorPhone = document.getElementById('operator-phone');
    const operatorSpecialty = document.getElementById('operator-specialty');
    const operatorExperience = document.getElementById('operator-experience');
    const operatorStatus = document.getElementById('operator-status');
    const operatorNotes = document.getElementById('operator-notes');
    
    if (modalTitle) modalTitle.textContent = 'Operatör Düzenle';
    if (modalSubmitBtn) modalSubmitBtn.textContent = 'Güncelle';
    
    if (operatorName) operatorName.value = operator.name || '';
    if (operatorEmail) operatorEmail.value = operator.email || '';
    if (operatorPhone) operatorPhone.value = operator.phone || '';
    if (operatorSpecialty) operatorSpecialty.value = operator.specialty || '';
    if (operatorExperience) operatorExperience.value = operator.experience || 1;
    if (operatorStatus) operatorStatus.value = operator.status || 'aktif';
    if (operatorNotes) operatorNotes.value = operator.notes || '';
    
    // Store operator ID for update
    window.currentOperatorId = operatorId;
    
    if (operatorModal) {
        operatorModal.style.display = 'flex';
    }
}

// Delete operator function
async function deleteOperator(operatorId, operatorName) {
    if (!confirm(`"${operatorName}" operatörünü silmek istediğinizden emin misiniz?`)) {
        return;
    }
    
    try {
        await db.collection('operators').doc(operatorId).delete();
        
        // Remove from local array
        operators = operators.filter(op => op.id !== operatorId);
        
        // Update UI
        updateOperatorsList();
        updateStats();
        
        showSuccess('Operatör başarıyla silindi!');
        
    } catch (error) {
        console.error('Error deleting operator:', error);
        showError('Operatör silinirken bir hata oluştu.');
    }
}

// Edit request function
function editRequest(requestId) {
    const request = requests.find(req => req.id === requestId);
    if (!request) return;
    
    const requestModal = document.getElementById('request-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalSubmitBtn = document.getElementById('modal-submit-btn');
    const requestUnit = document.getElementById('request-unit');
    const requestDescription = document.getElementById('request-description');
    const requestUrgency = document.getElementById('request-urgency');
    const requestEstimated = document.getElementById('request-estimated');
    
    if (modalTitle) modalTitle.textContent = 'Talep Düzenle';
    if (modalSubmitBtn) modalSubmitBtn.textContent = 'Güncelle';
    
    if (requestUnit) requestUnit.value = request.unit || '';
    if (requestDescription) requestDescription.value = request.description || '';
    if (requestUrgency) requestUrgency.value = request.urgency || 'normal';
    if (requestEstimated) requestEstimated.value = request.estimatedDays || 3;
    
    // Store request ID for update
    window.currentRequestId = requestId;
    
    if (requestModal) {
        requestModal.style.display = 'flex';
    }
}

// Handle request submit
async function handleRequestSubmit(e) {
    e.preventDefault();
    
    const unitSelect = document.getElementById('request-unit');
    const descriptionTextarea = document.getElementById('request-description');
    const estimatedDaysInput = document.getElementById('request-estimated');
    const urgencySelect = document.getElementById('request-urgency');
    
    if (!unitSelect || !descriptionTextarea || !estimatedDaysInput || !urgencySelect) {
        showError('Form elemanları yüklenemedi.');
        return;
    }
    
    const unit = unitSelect.value;
    const description = descriptionTextarea.value;
    const estimatedDays = parseInt(estimatedDaysInput.value);
    const urgency = urgencySelect.value;
    
    if (!unit || !description || !estimatedDays) {
        showError('Lütfen tüm alanları doldurun.');
        return;
    }
    
    try {
        const modalSubmitBtn = document.getElementById('modal-submit-btn');
        if (modalSubmitBtn) {
            modalSubmitBtn.disabled = true;
            modalSubmitBtn.innerHTML = '<span class="btn-text">Kaydediliyor...</span><span class="loading-spinner"></span>';
            modalSubmitBtn.classList.add('loading');
        }
        
        const requestData = {
            unit,
            description,
            estimatedDays,
            urgency,
            status: "new",
            operator: "",
            actualDays: null,
            startDate: null,
            completionDate: null,
            date: new Date().toISOString().split('T')[0],
            createdBy: currentUser.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (window.currentRequestId) {
            // Update existing request
            requestData.updatedBy = currentUser.email;
            await db.collection('requests').doc(window.currentRequestId).update(requestData);
            showSuccess('Talep başarıyla güncellendi!');
            delete window.currentRequestId;
        } else {
            // Add new request
            // Generate request number
            const requestNumber = requests.length > 0 
                ? Math.max(...requests.map(req => req.requestNumber || 0)) + 1 
                : 1001;
            
            requestData.requestNumber = requestNumber;
            
            await db.collection('requests').add(requestData);
            showSuccess('Talep başarıyla eklendi!');
        }
        
        closeAllModals();
        
        // Reload data
        await loadRequestsFromFirestore();
        
    } catch (error) {
        console.error('Error saving request:', error);
        showError('Talep kaydedilirken bir hata oluştu.');
    } finally {
        const modalSubmitBtn = document.getElementById('modal-submit-btn');
        if (modalSubmitBtn) {
            modalSubmitBtn.disabled = false;
            modalSubmitBtn.innerHTML = '<span class="btn-text">' + (window.currentRequestId ? 'Güncelle' : 'Talep Ekle') + '</span>';
            modalSubmitBtn.classList.remove('loading');
        }
    }
}

// Handle operator submit
async function handleOperatorSubmit(e) {
    e.preventDefault();
    
    const operatorName = document.getElementById('operator-name');
    const operatorEmail = document.getElementById('operator-email');
    const operatorPhone = document.getElementById('operator-phone');
    const operatorSpecialty = document.getElementById('operator-specialty');
    const operatorExperience = document.getElementById('operator-experience');
    const operatorStatus = document.getElementById('operator-status');
    const operatorNotes = document.getElementById('operator-notes');
    
    if (!operatorName || !operatorSpecialty) {
        showError('Form elemanları yüklenemedi.');
        return;
    }
    
    const name = operatorName.value.trim();
    const email = operatorEmail ? operatorEmail.value.trim() : '';
    const phone = operatorPhone ? operatorPhone.value.trim() : '';
    const specialty = operatorSpecialty.value;
    const experience = operatorExperience ? parseInt(operatorExperience.value) || 0 : 0;
    const status = operatorStatus ? operatorStatus.value : 'aktif';
    const notes = operatorNotes ? operatorNotes.value.trim() : '';
    
    if (!name || !specialty) {
        showError('Lütfen zorunlu alanları doldurun (Ad, Uzmanlık).');
        return;
    }
    
    if (name.length < 2) {
        showError('Operatör adı en az 2 karakter olmalıdır.');
        return;
    }
    
    try {
        const modalSubmitBtn = document.getElementById('operator-modal-submit-btn');
        if (modalSubmitBtn) {
            modalSubmitBtn.disabled = true;
            modalSubmitBtn.innerHTML = '<span class="btn-text">Kaydediliyor...</span><span class="loading-spinner"></span>';
            modalSubmitBtn.classList.add('loading');
        }
        
        const operatorData = {
            name,
            email,
            phone,
            specialty,
            experience,
            status,
            notes,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: currentUser.email
        };
        
        if (window.currentOperatorId) {
            // Update existing operator
            await db.collection('operators').doc(window.currentOperatorId).update(operatorData);
            showSuccess('Operatör başarıyla güncellendi!');
            delete window.currentOperatorId;
        } else {
            // Add new operator
            operatorData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            operatorData.createdBy = currentUser.email;
            
            await db.collection('operators').add(operatorData);
            showSuccess('Operatör başarıyla eklendi!');
        }
        
        closeAllModals();
        
        // Reload data
        await loadOperatorsFromFirestore();
        
    } catch (error) {
        console.error('Error saving operator:', error);
        showError('Operatör kaydedilirken bir hata oluştu.');
    } finally {
        const modalSubmitBtn = document.getElementById('operator-modal-submit-btn');
        if (modalSubmitBtn) {
            modalSubmitBtn.disabled = false;
            modalSubmitBtn.innerHTML = '<span class="btn-text">' + (window.currentOperatorId ? 'Güncelle' : 'Operatör Ekle') + '</span>';
            modalSubmitBtn.classList.remove('loading');
        }
    }
}

// Assign request to operator
async function assignRequest(requestId) {
    const request = requests.find(req => req.id === requestId);
    if (!request) return;
    
    // Create modal for operator selection
    const assignModal = document.createElement('div');
    assignModal.className = 'modal';
    assignModal.id = 'assign-modal';
    assignModal.style.display = 'flex';
    
    const activeOperators = operators.filter(op => op.status === 'aktif');
    
    let operatorOptions = '';
    activeOperators.forEach(operator => {
        operatorOptions += `<option value="${operator.name}">${operator.name} - ${operator.specialty}</option>`;
    });
    
    assignModal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Talep Operatöre Ata</h3>
                <button class="close-modal" onclick="document.getElementById('assign-modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="assign-operator">Operatör Seçin</label>
                    <select id="assign-operator" class="form-control">
                        <option value="">Operatör Seçin</option>
                        ${operatorOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label for="assign-start-date">Başlangıç Tarihi</label>
                    <input type="date" id="assign-start-date" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 30px;">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('assign-modal').remove()">İptal</button>
                    <button type="button" class="btn btn-primary" onclick="confirmAssign('${requestId}')">Ata</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(assignModal);
}

// Confirm assignment
async function confirmAssign(requestId) {
    const operatorSelect = document.getElementById('assign-operator');
    const startDateInput = document.getElementById('assign-start-date');
    
    if (!operatorSelect || !startDateInput) {
        showError('Form elemanları bulunamadı.');
        return;
    }
    
    const operator = operatorSelect.value;
    const startDate = startDateInput.value;
    
    if (!operator || !startDate) {
        showError('Lütfen tüm alanları doldurun.');
        return;
    }
    
    try {
        const requestData = {
            operator,
            startDate,
            status: 'assigned',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: currentUser.email
        };
        
        await db.collection('requests').doc(requestId).update(requestData);
        
        // Close modal
        const assignModal = document.getElementById('assign-modal');
        if (assignModal) assignModal.remove();
        
        showSuccess('Talep operatöre atandı!');
        
        // Reload data
        await loadRequestsFromFirestore();
        
    } catch (error) {
        console.error('Error assigning request:', error);
        showError('Talep atanırken bir hata oluştu.');
    }
}

// Start work on request
async function startRequest(requestId) {
    const request = requests.find(req => req.id === requestId);
    if (!request || request.status !== 'assigned') return;
    
    try {
        const requestData = {
            status: 'inprogress',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: currentUser.email
        };
        
        await db.collection('requests').doc(requestId).update(requestData);
        
        showSuccess('İş başlatıldı!');
        
        // Reload data
        await loadRequestsFromFirestore();
        
    } catch (error) {
        console.error('Error starting request:', error);
        showError('İş başlatılırken bir hata oluştu.');
    }
}

// Complete request
async function completeRequest(requestId) {
    const request = requests.find(req => req.id === requestId);
    if (!request || request.status !== 'inprogress') return;
    
    // Create modal for completion details
    const completeModal = document.createElement('div');
    completeModal.className = 'modal';
    completeModal.id = 'complete-modal';
    completeModal.style.display = 'flex';
    
    const startDate = new Date(request.startDate);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    completeModal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3>İşi Tamamla</h3>
                <button class="close-modal" onclick="document.getElementById('complete-modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="actual-days">Gerçekleşen Süre (gün)</label>
                    <input type="number" id="actual-days" class="form-control" value="${diffDays}" min="1" max="365">
                </div>
                <div class="form-group">
                    <label for="completion-notes">Tamamlanma Notları (Opsiyonel)</label>
                    <textarea id="completion-notes" class="form-control" placeholder="İş hakkında notlar..."></textarea>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 30px;">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('complete-modal').remove()">İptal</button>
                    <button type="button" class="btn btn-primary" onclick="confirmComplete('${requestId}')">Tamamla</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(completeModal);
}

// Confirm completion
async function confirmComplete(requestId) {
    const actualDaysInput = document.getElementById('actual-days');
    const completionNotesInput = document.getElementById('completion-notes');
    
    if (!actualDaysInput) {
        showError('Form elemanları bulunamadı.');
        return;
    }
    
    const actualDays = parseInt(actualDaysInput.value);
    const completionNotes = completionNotesInput ? completionNotesInput.value : '';
    const completionDate = new Date().toISOString().split('T')[0];
    
    if (!actualDays || actualDays < 1) {
        showError('Lütfen geçerli bir süre girin.');
        return;
    }
    
    try {
        const requestData = {
            status: 'completed',
            actualDays,
            completionDate,
            completionNotes,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: currentUser.email
        };
        
        await db.collection('requests').doc(requestId).update(requestData);
        
        // Close modal
        const completeModal = document.getElementById('complete-modal');
        if (completeModal) completeModal.remove();
        
        showSuccess('İş tamamlandı!');
        
        // Reload data
        await loadRequestsFromFirestore();
        
    } catch (error) {
        console.error('Error completing request:', error);
        showError('İş tamamlanırken bir hata oluştu.');
    }
}

// Reopen completed request
async function reopenRequest(requestId) {
    if (!confirm('Bu işi tekrar açmak istediğinizden emin misiniz? İş "Devam Ediyor" durumuna dönecektir.')) {
        return;
    }
    
    try {
        const requestData = {
            status: 'inprogress',
            completionDate: null,
            actualDays: null,
            completionNotes: null,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: currentUser.email
        };
        
        await db.collection('requests').doc(requestId).update(requestData);
        
        showSuccess('İş tekrar açıldı!');
        
        // Reload data
        await loadRequestsFromFirestore();
        
    } catch (error) {
        console.error('Error reopening request:', error);
        showError('İş geri açılırken bir hata oluştu.');
    }
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const profileNameInput = document.getElementById('profile-name');
    
    if (!profileNameInput || !currentUser) {
        showError('Form elemanları yüklenemedi.');
        return;
    }
    
    const name = profileNameInput.value.trim();
    
    if (!name || name.length < 2) {
        showError('Lütfen geçerli bir ad girin (en az 2 karakter).');
        return;
    }
    
    try {
        // Update display name
        await currentUser.updateProfile({
            displayName: name
        });
        
        // Close modal
        const profileModal = document.getElementById('profile-modal');
        if (profileModal) profileModal.style.display = 'none';
        
        // Update UI
        updateUserAvatar(name);
        
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) userNameElement.textContent = name;
        
        const userNameDropdown = document.getElementById('user-dropdown-name');
        if (userNameDropdown) userNameDropdown.textContent = name;
        
        showSuccess('Profil bilgileri güncellendi!');
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showError('Profil güncellenirken bir hata oluştu.');
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    
    // Clear stored IDs
    delete window.currentRequestId;
    delete window.currentOperatorId;
}