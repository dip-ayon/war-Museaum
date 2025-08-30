// Admin Panel JavaScript
let currentUser = null;
let currentSection = 'dashboard';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    setupEventListeners();
    loadDashboardData();
});

// Initialize Admin Panel
function initializeAdmin() {
    // Check if user is logged in and is admin
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'admin') {
        window.location.href = '/';
        return;
    }
    
    currentUser = user;
    updateUserInfo();
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation buttons
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            showSection(section);
        });
    });
    
    // Search functionality
    const artifactSearch = document.getElementById('artifactSearch');
    if (artifactSearch) {
        artifactSearch.addEventListener('input', debounce(searchArtifacts, 300));
    }
    
    // Filter functionality
    const typeFilter = document.getElementById('typeFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    if (typeFilter) {
        typeFilter.addEventListener('change', filterArtifacts);
    }
    if (dateFilter) {
        dateFilter.addEventListener('change', filterArtifacts);
    }
    
    // Form submissions
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUploadSubmit);
    }
    
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', handleUserSubmit);
    }
    
    // Modal close events
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

// Update User Information
function updateUserInfo() {
    const adminName = document.getElementById('adminName');
    const adminEmail = document.getElementById('adminEmail');
    
    if (adminName) adminName.textContent = currentUser.name || 'Admin User';
    if (adminEmail) adminEmail.textContent = currentUser.email || 'admin@museum.com';
}

// Show Section
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show target section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    currentSection = sectionName;
    
    // Load section-specific data
    switch (sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'artifacts':
            loadArtifacts();
            break;
        case 'users':
            loadUsers();
            break;
        case 'reports':
            loadReportStats();
            break;
        case 'logs':
            loadSystemLogs();
            break;
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        const response = await fetch('/api/dashboard', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateDashboardStats(data);
            updateRecentActivity(data.recentActivity || []);
        }
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

// Update Dashboard Statistics
function updateDashboardStats(data) {
    const totalArtifacts = document.getElementById('totalArtifacts');
    const totalUsers = document.getElementById('totalUsers');
    const totalViews = document.getElementById('totalViews');
    const recentUploads = document.getElementById('recentUploads');
    
    if (totalArtifacts) totalArtifacts.textContent = data.totalArtifacts || 0;
    if (totalUsers) totalUsers.textContent = data.totalUsers || 0;
    if (totalViews) totalViews.textContent = data.totalViews || 0;
    if (recentUploads) recentUploads.textContent = data.recentUploads || 0;
}

// Update Recent Activity
function updateRecentActivity(activities) {
    const activityList = document.getElementById('recentActivity');
    if (!activityList) return;
    
    if (activities.length === 0) {
        activityList.innerHTML = '<p class="text-muted">No recent activity</p>';
        return;
    }
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas ${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description} - ${formatTimeAgo(activity.timestamp)}</p>
            </div>
        </div>
    `).join('');
}

// Get Activity Icon
function getActivityIcon(type) {
    const icons = {
        'upload': 'fa-upload',
        'user': 'fa-user-plus',
        'login': 'fa-sign-in-alt',
        'report': 'fa-file-alt',
        'delete': 'fa-trash',
        'edit': 'fa-edit'
    };
    return icons[type] || 'fa-info-circle';
}

// Load Artifacts
async function loadArtifacts() {
    try {
        const response = await fetch('/api/artifacts', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const artifacts = await response.json();
            displayArtifactsTable(artifacts);
        }
    } catch (error) {
        console.error('Failed to load artifacts:', error);
        showNotification('Failed to load artifacts', 'error');
    }
}

// Display Artifacts Table
function displayArtifactsTable(artifacts) {
    const tbody = document.getElementById('artifactsTable');
    if (!tbody) return;
    
    if (artifacts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No artifacts found</td></tr>';
        return;
    }
    
    tbody.innerHTML = artifacts.map(artifact => `
        <tr>
            <td>${artifact.collection_no || 'N/A'}</td>
            <td>${artifact.object_head || 'Unnamed Artifact'}</td>
            <td>${artifact.object_type || 'Unknown'}</td>
            <td>${artifact.donor || 'Unknown'}</td>
            <td>${formatDate(artifact.created_at)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-outline btn-sm" onclick="editArtifact(${artifact.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteArtifact(${artifact.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load Users
async function loadUsers() {
    try {
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const users = await response.json();
            displayUsersTable(users);
        }
    } catch (error) {
        console.error('Failed to load users:', error);
        showNotification('Failed to load users', 'error');
    }
}

// Display Users Table
function displayUsersTable(users) {
    const tbody = document.getElementById('usersTable');
    if (!tbody) return;
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}">${user.role}</span></td>
            <td><span class="badge badge-success">Active</span></td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-outline btn-sm" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load Report Statistics
async function loadReportStats() {
    try {
        const response = await fetch('/api/dashboard', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateReportStats(data);
        }
    } catch (error) {
        console.error('Failed to load report stats:', error);
    }
}

// Update Report Statistics
function updateReportStats(data) {
    const reportTotalArtifacts = document.getElementById('reportTotalArtifacts');
    const reportTotalUsers = document.getElementById('reportTotalUsers');
    const systemUptime = document.getElementById('systemUptime');
    const storageUsed = document.getElementById('storageUsed');
    
    if (reportTotalArtifacts) reportTotalArtifacts.textContent = data.totalArtifacts || 0;
    if (reportTotalUsers) reportTotalUsers.textContent = data.totalUsers || 0;
    if (systemUptime) systemUptime.textContent = '7 days'; // This would come from server
    if (storageUsed) storageUsed.textContent = '125 MB'; // This would come from server
}

// Load System Logs
async function loadSystemLogs() {
    try {
        const response = await fetch('/api/logs', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const logs = await response.json();
            displaySystemLogs(logs);
        }
    } catch (error) {
        console.error('Failed to load system logs:', error);
        showNotification('Failed to load system logs', 'error');
    }
}

// Display System Logs
function displaySystemLogs(logs) {
    const tbody = document.getElementById('logsTable');
    if (!tbody) return;
    
    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No logs found</td></tr>';
        return;
    }
    
    tbody.innerHTML = logs.map(log => {
        const timestamp = log.created_at || log.timestamp;
        const user = log.user_name || log.user || 'System';
        const level = log.level || 'info';
        return `
        <tr>
            <td>${formatDateTime(timestamp)}</td>
            <td><span class="badge badge-${getLogLevelClass(level)}">${level}</span></td>
            <td>${user}</td>
            <td>${log.action}</td>
            <td>${log.details}</td>
        </tr>`;
    }).join('');
}

// Get Log Level Class
function getLogLevelClass(level) {
    const classes = {
        'info': 'info',
        'warning': 'warning',
        'error': 'danger'
    };
    return classes[level] || 'info';
}

// Search Artifacts
function searchArtifacts() {
    const searchTerm = document.getElementById('artifactSearch').value;
    // Implement search functionality
    console.log('Searching for:', searchTerm);
}

// Filter Artifacts
function filterArtifacts() {
    const typeFilter = document.getElementById('typeFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    // Implement filter functionality
    console.log('Filtering by:', { typeFilter, dateFilter });
}

// Generate Report
async function generateReport() {
    const sortBy = document.getElementById('sortBy').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    try {
        const response = await fetch('/api/reports/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                sortBy,
                startDate,
                endDate
            })
        });
        
        if (response.ok) {
            showNotification('Report generated successfully', 'success');
        } else {
            showNotification('Failed to generate report', 'error');
        }
    } catch (error) {
        console.error('Failed to generate report:', error);
        showNotification('Failed to generate report', 'error');
    }
}

// Download Excel
async function downloadExcel() {
    try {
        const response = await fetch('/api/reports/excel', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'museum-report.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
            showNotification('Excel file downloaded successfully', 'success');
        } else {
            showNotification('Failed to download Excel file', 'error');
        }
    } catch (error) {
        console.error('Failed to download Excel:', error);
        showNotification('Failed to download Excel file', 'error');
    }
}

// Refresh Logs
function refreshLogs() {
    loadSystemLogs();
    showNotification('Logs refreshed', 'info');
}

// Modal Functions
function openUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('uploadForm').reset();
    }
}

function openUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('userForm').reset();
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.classList.remove('active'));
}

// Form Handlers
async function handleUploadSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('/api/artifacts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: formData
        });
        
        if (response.ok) {
            showNotification('Artifact uploaded successfully', 'success');
            closeUploadModal();
            loadArtifacts();
        } else {
            const data = await response.json();
            showNotification(data.error || 'Failed to upload artifact', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Failed to upload artifact', 'error');
    }
}

async function handleUserSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            showNotification('User created successfully', 'success');
            closeUserModal();
            loadUsers();
        } else {
            const data = await response.json();
            showNotification(data.error || 'Failed to create user', 'error');
        }
    } catch (error) {
        console.error('User creation error:', error);
        showNotification('Failed to create user', 'error');
    }
}

// CRUD Operations
async function editArtifact(id) {
    // Implement edit functionality
    showNotification('Edit functionality coming soon', 'info');
}

async function deleteArtifact(id) {
    if (!confirm('Are you sure you want to delete this artifact?')) return;
    
    try {
        const response = await fetch(`/api/artifacts/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            showNotification('Artifact deleted successfully', 'success');
            loadArtifacts();
        } else {
            showNotification('Failed to delete artifact', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Failed to delete artifact', 'error');
    }
}

async function editUser(id) {
    // Implement edit functionality
    showNotification('Edit functionality coming soon', 'info');
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            showNotification('User deleted successfully', 'success');
            loadUsers();
        } else {
            showNotification('Failed to delete user', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Failed to delete user', 'error');
    }
}

// Logout Function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Notification System
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Export functions to window
window.showSection = showSection;
window.openUploadModal = openUploadModal;
window.closeUploadModal = closeUploadModal;
window.openUserModal = openUserModal;
window.closeUserModal = closeUserModal;
window.generateReport = generateReport;
window.downloadExcel = downloadExcel;
window.refreshLogs = refreshLogs;
window.logout = logout;
