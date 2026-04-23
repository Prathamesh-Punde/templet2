// API Configuration
const API_URL = '/api';

function clearSessionAndRedirect() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../admin/admin-login.html';
}

function getStoredUser() {
    try {
        const rawUser = localStorage.getItem('user');
        return rawUser ? JSON.parse(rawUser) : null;
    } catch (error) {
        return null;
    }
}

// Check authentication
const token = localStorage.getItem('token');
let user = getStoredUser();

function normalizeRole(role) {
    return String(role || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function hasAnyRole(...allowedRoles) {
    const currentRole = normalizeRole(user && user.role);
    return allowedRoles.some((role) => normalizeRole(role) === currentRole);
}

function isSuperAdminRole() {
    const currentRole = normalizeRole(user && user.role);
    return currentRole === 'super_admin' || currentRole.includes('super_admin') || currentRole.includes('superadmin');
}

if (!token || !user) {
    clearSessionAndRedirect();
    throw new Error('Invalid session. Redirecting to login.');
}

// Set user info
function updateUserHeader() {
    document.getElementById('userName').textContent = user.username;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userRole').textContent = String(user.role || '').replace(/_/g, ' ').toUpperCase();
}

async function syncUserProfile() {
    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return;
        }

        const data = await response.json();
        if (data && data.user) {
            user = data.user;
            localStorage.setItem('user', JSON.stringify(data.user));
        }
    } catch (error) {
        console.error('Unable to sync profile:', error);
    }
}

// Show/hide navigation based on role
function setupNavigation() {
    const navMenu = document.getElementById('navMenu');
    const careersNav = document.getElementById('careersNav');
    const supportNav = document.getElementById('supportNav');
    const enquiriesNav = document.getElementById('enquiriesNav');
    const customersNav = document.getElementById('customersNav');
    const usersNav = document.getElementById('usersNav');
    const superAdminQuickActions = document.getElementById('superAdminQuickActions');

    const isSuperAdmin = isSuperAdminRole();
    const canViewCareers = hasAnyRole('hr', 'super_admin') || isSuperAdmin;
    const canViewSupport = hasAnyRole('customer_support', 'super_admin') || isSuperAdmin;
    const canViewEnquiries = hasAnyRole('enquiry_follow_up_executive', 'super_admin') || isSuperAdmin;

    if (isSuperAdmin) {
        navMenu.classList.add('super-admin-grid');
    } else {
        navMenu.classList.remove('super-admin-grid');
    }

    careersNav.style.display = canViewCareers ? 'block' : 'none';
    supportNav.style.display = canViewSupport ? 'block' : 'none';
    enquiriesNav.style.display = canViewEnquiries ? 'block' : 'none';
    customersNav.style.display = isSuperAdmin ? 'block' : 'none';
    usersNav.style.display = isSuperAdmin ? 'block' : 'none';
    superAdminQuickActions.style.display = isSuperAdmin ? 'flex' : 'none';
}

function openAddUserFromDashboard() {
    const usersNavLink = document.querySelector('.nav-menu a[data-section="users"]');
    const usersFrame = document.getElementById('usersFrame');

    if (!usersNavLink || !usersFrame) {
        return;
    }

    // Reuse existing navigation logic by triggering the users tab click.
    usersNavLink.click();

    // Ask the users iframe to open the Add User modal.
    setTimeout(() => {
        usersFrame.contentWindow.postMessage({ type: 'OPEN_ADD_USER_MODAL' }, window.location.origin);
    }, 150);
}

// Load dashboard statistics
async function loadStatistics() {
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = '';
    
    try {
        if (hasAnyRole('hr', 'super_admin')) {
            const response = await fetch(`${API_URL}/careers`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            const activeCount = data.careers.filter(c => c.is_active).length;
            
            statsGrid.innerHTML += `
                <div class="stat-card">
                    <h3>Total Careers</h3>
                    <div class="number">${data.count}</div>
                </div>
                <div class="stat-card">
                    <h3>Active Positions</h3>
                    <div class="number">${activeCount}</div>
                </div>
            `;
        }
        
        if (hasAnyRole('customer_support', 'super_admin')) {
            const response = await fetch(`${API_URL}/support/tickets/statistics`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            const stats = data.statistics;
            
            statsGrid.innerHTML += `
                <div class="stat-card">
                    <h3>Total Tickets</h3>
                    <div class="number">${stats.total_tickets}</div>
                </div>
                <div class="stat-card">
                    <h3>Pending</h3>
                    <div class="number">${stats.pending}</div>
                </div>
                <div class="stat-card">
                    <h3>In Progress</h3>
                    <div class="number">${stats.in_progress}</div>
                </div>
                <div class="stat-card">
                    <h3>Resolved</h3>
                    <div class="number">${stats.resolved}</div>
                </div>
            `;
        }

        if (hasAnyRole('enquiry_follow_up_executive', 'super_admin')) {
            const response = await fetch(`${API_URL}/enquiries/statistics`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            const stats = data.statistics;

            statsGrid.innerHTML += `
                <div class="stat-card">
                    <h3>Total Enquiries</h3>
                    <div class="number">${stats.total_enquiries}</div>
                </div>
                <div class="stat-card">
                    <h3>New</h3>
                    <div class="number">${stats.new_count}</div>
                </div>
                <div class="stat-card">
                    <h3>Contacted</h3>
                    <div class="number">${stats.contacted}</div>
                </div>
                <div class="stat-card">
                    <h3>Follow Up</h3>
                    <div class="number">${stats.follow_up}</div>
                </div>
                <div class="stat-card">
                    <h3>Converted</h3>
                    <div class="number">${stats.converted}</div>
                </div>
            `;
        }
        
        if (hasAnyRole('super_admin')) {
            const response = await fetch(`${API_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            const customersResponse = await fetch(`${API_URL}/customers`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const customersData = await customersResponse.json();
            
            statsGrid.innerHTML += `
                <div class="stat-card">
                    <h3>Total Users</h3>
                    <div class="number">${data.count}</div>
                </div>
                <div class="stat-card">
                    <h3>Total Customers</h3>
                    <div class="number">${customersData.count || 0}</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Navigation handler
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active link
        document.querySelectorAll('.nav-menu a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show corresponding section
        const section = link.getAttribute('data-section');
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        document.getElementById(section).classList.add('active');
        
        // Update page title
        document.getElementById('pageTitle').textContent = 
            link.textContent.charAt(0).toUpperCase() + link.textContent.slice(1);
    });
});

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../admin/admin-login.html';
});

const quickAddUserBtn = document.getElementById('quickAddUserBtn');
if (quickAddUserBtn) {
    quickAddUserBtn.addEventListener('click', openAddUserFromDashboard);
}

// Initialize
async function initializeDashboard() {
    await syncUserProfile();
    updateUserHeader();
    setupNavigation();
    // Re-apply once more after initial render to override any stale inline styles.
    setTimeout(setupNavigation, 0);
    loadStatistics();
}

initializeDashboard();
