// API Configuration
const API_URL = '/api';
const token = localStorage.getItem('token');

function openAddUserModal() {
    document.getElementById('modalTitle').textContent = 'Add New User';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('passwordGroup').style.display = 'block';
    document.getElementById('password').required = true;
    document.getElementById('isActiveGroup').style.display = 'none';
    document.getElementById('userModal').classList.add('show');
}

// Load users
async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        const tbody = document.getElementById('usersTableBody');
        
        if (data.users && data.users.length > 0) {
            tbody.innerHTML = data.users.map(user => {
                const createdDate = new Date(user.created_at).toLocaleDateString();
                return `
                    <tr>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>
                            <span class="role-badge">
                                ${user.role.replace('_', ' ').toUpperCase()}
                            </span>
                        </td>
                        <td>
                            <span class="status-badge ${user.is_active ? 'status-active' : 'status-inactive'}">
                                ${user.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td>${createdDate}</td>
                        <td>
                            <button class="btn btn-warning" onclick="editUser(${user.id})">Edit</button>
                            <button class="btn btn-danger" onclick="deleteUser(${user.id})">Delete</button>
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No users found.</td></tr>';
        }
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('usersTableBody').innerHTML = 
            '<tr><td colspan="6" class="empty-state">Error loading users. Please try again.</td></tr>';
    }
}

// Add user button
document.getElementById('addUserBtn').addEventListener('click', () => {
    openAddUserModal();
});

window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) {
        return;
    }

    if (event.data && event.data.type === 'OPEN_ADD_USER_MODAL') {
        openAddUserModal();
    }
});

// Cancel button
document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('userModal').classList.remove('show');
});

// Form submission
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value;
    
    // For new user creation
    if (!userId) {
        const formData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            role: document.getElementById('role').value
        };
        
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                document.getElementById('userModal').classList.remove('show');
                loadUsers();
                alert('User created successfully!');
            } else {
                const error = await response.json();
                alert('Error: ' + (error.message || 'User creation failed'));
            }
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Network error. Please try again.');
        }
    } else {
        // For updating existing user
        const formData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            role: document.getElementById('role').value,
            is_active: document.getElementById('is_active').value === 'true'
        };
        
        try {
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                document.getElementById('userModal').classList.remove('show');
                loadUsers();
                alert('User updated successfully!');
            } else {
                const error = await response.json();
                alert('Error: ' + (error.message || 'Update failed'));
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Network error. Please try again.');
        }
    }
});

// Edit user
async function editUser(id) {
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        const user = data.user;
        
        document.getElementById('modalTitle').textContent = 'Edit User';
        document.getElementById('userId').value = user.id;
        document.getElementById('username').value = user.username;
        document.getElementById('email').value = user.email;
        document.getElementById('role').value = user.role;
        document.getElementById('is_active').value = user.is_active.toString();
        
        // Hide password field for editing
        document.getElementById('passwordGroup').style.display = 'none';
        document.getElementById('password').required = false;
        document.getElementById('isActiveGroup').style.display = 'block';
        
        document.getElementById('userModal').classList.add('show');
    } catch (error) {
        console.error('Error loading user:', error);
        alert('Error loading user details.');
    }
}

// Delete user
async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            loadUsers();
            alert('User deleted successfully!');
        } else {
            const error = await response.json();
            alert('Error: ' + (error.message || 'Delete failed'));
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Network error. Please try again.');
    }
}

// Initialize
loadUsers();
