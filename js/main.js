// Global variables
let currentUser = null;
let currentSlideIndex = 0;
let slideshowInterval;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    startSlideshow();
    loadArtifacts();
});

// Initialize the application
function initializeApp() {
            // Check if user is logged in
        const token = localStorage.getItem('authToken');
        if (token) {
            currentUser = JSON.parse(localStorage.getItem('user'));
            updateAuthButtons();
        }
        
        // Set default admin email in login form for convenience
        const loginEmail = document.getElementById('loginEmail');
        if (loginEmail) {
            loginEmail.placeholder = 'admin@museum.org';
        }
    
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.main-nav');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
    }
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            scrollToSection(target);
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchValue');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchArtifacts();
            }
        });
    }
    
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterArtifacts(btn.dataset.filter);
        });
    });
    
    // Smooth scrolling for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            scrollToSection(target);
        });
    });
}

// Slideshow functionality
function startSlideshow() {
    const slides = document.querySelectorAll('.slides');
    const indicators = document.querySelectorAll('.indicator');
    
    if (slides.length === 0) return;
    
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        currentSlideIndex = index;
    }
    
    function nextSlide() {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        showSlide(currentSlideIndex);
    }
    
    // Auto-advance slides
    slideshowInterval = setInterval(nextSlide, 5000);
    
    // Pause on hover
    const slideshow = document.querySelector('.slideshow');
    if (slideshow) {
        slideshow.addEventListener('mouseenter', () => clearInterval(slideshowInterval));
        slideshow.addEventListener('mouseleave', () => {
            slideshowInterval = setInterval(nextSlide, 5000);
        });
    }
}

// Global slideshow functions
window.plusSlides = function(n) {
    const slides = document.querySelectorAll('.slides');
    const indicators = document.querySelectorAll('.indicator');
    
    if (slides.length === 0) return;
    
    currentSlideIndex = (currentSlideIndex + n + slides.length) % slides.length;
    
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    slides[currentSlideIndex].classList.add('active');
    indicators[currentSlideIndex].classList.add('active');
    
    // Reset interval
    clearInterval(slideshowInterval);
    slideshowInterval = setInterval(() => {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        slides[currentSlideIndex].classList.add('active');
        indicators[currentSlideIndex].classList.add('active');
    }, 5000);
};

window.currentSlide = function(n) {
    const slides = document.querySelectorAll('.slides');
    const indicators = document.querySelectorAll('.indicator');
    
    if (slides.length === 0) return;
    
    currentSlideIndex = n - 1;
    
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    slides[currentSlideIndex].classList.add('active');
    indicators[currentSlideIndex].classList.add('active');
    
    // Reset interval
    clearInterval(slideshowInterval);
    slideshowInterval = setInterval(() => {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        slides[currentSlideIndex].classList.add('active');
        indicators[currentSlideIndex].classList.add('active');
    }, 5000);
};

// Smooth scrolling
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Authentication functions
async function registerUser(userData) {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Registration successful! Please login.', 'success');
            closeRegisterModal();
            openLoginModal();
        } else {
            showNotification(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    }
}

async function loginUser(credentials) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            
            updateAuthButtons();
            closeLoginModal();
            showNotification(`Welcome back, ${data.user.name}!`, 'success');
            
            // Redirect to admin panel if admin
            if (data.user.role === 'admin') {
                setTimeout(() => {
                    window.location.href = '/admin';
                }, 1000);
            }
        } else {
            showNotification(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    currentUser = null;
    updateAuthButtons();
    showNotification('Logged out successfully', 'success');
}

function updateAuthButtons() {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;
    
    if (currentUser) {
        authButtons.innerHTML = `
            <div class="user-menu">
                <button class="btn btn-outline btn-glow" onclick="toggleUserMenu()">
                    <i class="fas fa-user"></i>
                    ${currentUser.name}
                </button>
                <div class="user-dropdown" id="userDropdown">
                    <a href="#" onclick="showProfile()">
                        <i class="fas fa-user-circle"></i>
                        Profile
                    </a>
                    ${currentUser.role === 'admin' ? 
                        '<a href="/admin"><i class="fas fa-cog"></i> Admin Panel</a>' : ''}
                    <a href="#" onclick="logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        Logout
                    </a>
                </div>
            </div>
        `;
    } else {
        authButtons.innerHTML = `
            <button class="btn btn-outline btn-glow" onclick="openLoginModal()">
                <i class="fas fa-sign-in-alt"></i>
                Login
            </button>
            <button class="btn btn-primary btn-glow" onclick="openRegisterModal()">
                <i class="fas fa-user-plus"></i>
                Register
            </button>
        `;
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('active');
}

// Modal functions
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function openRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function openExploreModal() {
    scrollToSection('exhibits');
}

// Search and filter functions
async function searchArtifacts() {
    const searchType = document.getElementById('searchType')?.value || 'collectionNo';
    const searchValue = document.getElementById('searchValue')?.value || '';
    
    if (!searchValue.trim()) {
        showNotification('Please enter a search term', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`/api/artifacts?searchBy=${searchType}&searchValue=${encodeURIComponent(searchValue)}`);
        const artifacts = await response.json();
        
        displayArtifacts(artifacts);
        updateResultCount(artifacts.length);
        
        if (artifacts.length === 0) {
            showNotification('No artifacts found matching your search', 'info');
        }
    } catch (error) {
        showNotification('Search failed. Please try again.', 'error');
    }
}

// Search from slideshow
async function searchArtifactsFromSlideshow() {
    const searchType = document.getElementById('slideshowSearchType')?.value || 'collectionNo';
    const searchValue = document.getElementById('slideshowSearchValue')?.value || '';
    
    if (!searchValue.trim()) {
        showNotification('Please enter a search term', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`/api/artifacts?searchBy=${searchType}&searchValue=${encodeURIComponent(searchValue)}`);
        const artifacts = await response.json();
        
        displayArtifacts(artifacts);
        updateResultCount(artifacts.length);
        
        if (artifacts.length === 0) {
            showNotification('No artifacts found matching your search', 'info');
        } else {
            // Scroll to exhibits section
            scrollToSection('exhibits');
        }
    } catch (error) {
        showNotification('Search failed. Please try again.', 'error');
    }
}

function filterArtifacts(filter) {
    // This would typically make an API call with filter parameters
    // For now, we'll just show a notification
    showNotification(`Filtering by: ${filter}`, 'info');
}

async function loadArtifacts() {
    try {
        const response = await fetch('/api/artifacts');
        const artifacts = await response.json();
        
        displayArtifacts(artifacts.slice(0, 6)); // Show first 6 artifacts
    } catch (error) {
        console.error('Failed to load artifacts:', error);
    }
}

function displayArtifacts(artifacts) {
    const grid = document.getElementById('artifactsGrid');
    if (!grid) return;
    
    if (artifacts.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No artifacts found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = artifacts.map(artifact => `
        <div class="artifact-card" data-aos="fade-up">
            <div class="artifact-img">
                <img src="/public/assets/images/img${Math.floor(Math.random() * 5) + 1}.jpg" 
                     alt="${artifact.object_head || 'Artifact'}">
                <div class="artifact-overlay">
                    <button class="btn btn-primary" onclick="viewArtifact(${artifact.id})">
                        <i class="fas fa-eye"></i>
                        View Details
                    </button>
                </div>
            </div>
            <div class="artifact-info">
                <h3>${artifact.object_head || 'Unnamed Artifact'}</h3>
                <div class="artifact-meta">
                    <span><i class="fas fa-hashtag"></i> ${artifact.collection_no}</span>
                    <span><i class="fas fa-user"></i> ${artifact.donor || 'Unknown'}</span>
                </div>
                <p>${artifact.description || 'No description available'}</p>
                <div class="artifact-tags">
                    <span class="tag">${artifact.object_type || 'Unknown Type'}</span>
                    <span class="tag">${artifact.collection_date || 'Unknown Date'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function updateResultCount(count) {
    const resultCount = document.getElementById('resultCount');
    if (resultCount) {
        resultCount.textContent = count;
    }
}

function viewArtifact(id) {
    // This would open a detailed view modal
    showNotification(`Viewing artifact ${id}`, 'info');
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Close user dropdown when clicking outside
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown && !event.target.closest('.user-menu')) {
        userDropdown.classList.remove('active');
    }
};

// Handle form submissions
document.addEventListener('submit', function(e) {
    if (e.target.id === 'loginForm') {
        e.preventDefault();
        const formData = new FormData(e.target);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password')
        };
        loginUser(credentials);
    }
    
    if (e.target.id === 'registerForm') {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password')
        };
        registerUser(userData);
    }
});

// Export functions for global access
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openRegisterModal = openRegisterModal;
window.closeRegisterModal = closeRegisterModal;
window.openExploreModal = openExploreModal;
window.searchArtifacts = searchArtifacts;
window.searchArtifactsFromSlideshow = searchArtifactsFromSlideshow;
window.scrollToSection = scrollToSection;
window.logout = logout;
window.toggleUserMenu = toggleUserMenu;
