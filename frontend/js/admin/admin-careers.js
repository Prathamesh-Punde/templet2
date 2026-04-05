// API Configuration
const API_URL = '/api';
const token = localStorage.getItem('token');
let currentApplications = [];
let selectedApplicationId = null;

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString();
}

// Load careers
async function loadCareers() {
    try {
        const response = await fetch(`${API_URL}/careers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        const tbody = document.getElementById('careersTableBody');
        
        if (data.careers && data.careers.length > 0) {
            tbody.innerHTML = data.careers.map(career => `
                <tr>
                    <td>${career.job_title}</td>
                    <td>${career.department}</td>
                    <td>${career.location}</td>
                    <td>${career.employment_type}</td>
                    <td>
                        <span class="status-badge ${career.is_active ? 'status-active' : 'status-inactive'}">
                            ${career.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-warning" onclick="editCareer(${career.id})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteCareer(${career.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No careers found. Add your first career posting!</td></tr>';
        }
    } catch (error) {
        console.error('Error loading careers:', error);
        document.getElementById('careersTableBody').innerHTML = 
            '<tr><td colspan="6" class="empty-state">Error loading careers. Please try again.</td></tr>';
    }
}

async function loadApplications() {
    try {
        const response = await fetch(`${API_URL}/careers/applications`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        const tbody = document.getElementById('applicationsTableBody');
        currentApplications = data.applications || [];

        if (currentApplications.length > 0) {
            tbody.innerHTML = currentApplications.map(application => `
                <tr>
                    <td>${application.candidate_name}</td>
                    <td>${application.candidate_email}</td>
                    <td>${application.job_title}</td>
                    <td>${application.years_of_experience ?? '-'}</td>
                    <td>${application.status}</td>
                    <td>${formatDateTime(application.created_at)}</td>
                    <td>
                        <button class="btn btn-warning" onclick="reviewApplication(${application.id})">Review</button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No applications found yet.</td></tr>';
        }
    } catch (error) {
        console.error('Error loading applications:', error);
        document.getElementById('applicationsTableBody').innerHTML =
            '<tr><td colspan="7" class="empty-state">Error loading applications. Please try again.</td></tr>';
    }
}

function reviewApplication(id) {
    const application = currentApplications.find(item => item.id === id);
    if (!application) {
        alert('Application details not found.');
        return;
    }

    selectedApplicationId = id;
    document.getElementById('applicationReviewContent').innerHTML = `
        <div class="form-group"><label>Candidate Name</label><div>${application.candidate_name}</div></div>
        <div class="form-group"><label>Email</label><div>${application.candidate_email}</div></div>
        <div class="form-group"><label>Phone</label><div>${application.candidate_phone || '-'}</div></div>
        <div class="form-group"><label>Applied For</label><div>${application.job_title}</div></div>
        <div class="form-group"><label>Experience</label><div>${application.years_of_experience ?? '-'}</div></div>
        <div class="form-group"><label>Current Location</label><div>${application.current_location || '-'}</div></div>
        <div class="form-group"><label>Resume Link</label><div>${application.resume_link ? `<a href="${application.resume_link}" target="_blank">Open Resume</a>` : '-'}</div></div>
        <div class="form-group"><label>Cover Letter</label><div>${application.cover_letter || '-'}</div></div>
        <div class="form-group"><label>Applied On</label><div>${formatDateTime(application.created_at)}</div></div>
    `;

    document.getElementById('applicationReviewModal').classList.add('show');
}

function closeReviewModal() {
    selectedApplicationId = null;
    document.getElementById('applicationReviewModal').classList.remove('show');
}

async function rejectApplication() {
    if (!selectedApplicationId) {
        return;
    }

    if (!confirm('Reject this candidate application? This will permanently delete it.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/careers/applications/${selectedApplicationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            alert('Error: ' + (error.message || 'Failed to reject application'));
            return;
        }

        closeReviewModal();
        loadApplications();
        alert('Application rejected and removed successfully!');
    } catch (error) {
        console.error('Error rejecting application:', error);
        alert('Network error while rejecting application.');
    }
}

// Add career button
document.getElementById('addCareerBtn').addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = 'Add New Career';
    document.getElementById('careerForm').reset();
    document.getElementById('careerId').value = '';
    document.getElementById('careerModal').classList.add('show');
});

// Cancel button
document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('careerModal').classList.remove('show');
});

document.getElementById('keepApplicationBtn').addEventListener('click', closeReviewModal);
document.getElementById('rejectApplicationBtn').addEventListener('click', rejectApplication);

document.getElementById('refreshApplicationsBtn').addEventListener('click', loadApplications);

// Form submission
document.getElementById('careerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const careerId = document.getElementById('careerId').value;
    const formData = {
        job_title: document.getElementById('job_title').value,
        department: document.getElementById('department').value,
        location: document.getElementById('location').value,
        employment_type: document.getElementById('employment_type').value,
        salary_range: document.getElementById('salary_range').value,
        description: document.getElementById('description').value,
        requirements: document.getElementById('requirements').value,
        responsibilities: document.getElementById('responsibilities').value,
        is_active: document.getElementById('is_active').value === 'true'
    };
    
    try {
        const url = careerId ? `${API_URL}/careers/${careerId}` : `${API_URL}/careers`;
        const method = careerId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            document.getElementById('careerModal').classList.remove('show');
            loadCareers();
            alert(careerId ? 'Career updated successfully!' : 'Career created successfully!');
        } else {
            const error = await response.json();
            alert('Error: ' + (error.message || 'Operation failed'));
        }
    } catch (error) {
        console.error('Error saving career:', error);
        alert('Network error. Please try again.');
    }
});

// Edit career
async function editCareer(id) {
    try {
        const response = await fetch(`${API_URL}/careers/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        const career = data.career;
        
        document.getElementById('modalTitle').textContent = 'Edit Career';
        document.getElementById('careerId').value = career.id;
        document.getElementById('job_title').value = career.job_title;
        document.getElementById('department').value = career.department;
        document.getElementById('location').value = career.location;
        document.getElementById('employment_type').value = career.employment_type;
        document.getElementById('salary_range').value = career.salary_range || '';
        document.getElementById('description').value = career.description;
        document.getElementById('requirements').value = career.requirements;
        document.getElementById('responsibilities').value = career.responsibilities;
        document.getElementById('is_active').value = career.is_active.toString();
        
        document.getElementById('careerModal').classList.add('show');
    } catch (error) {
        console.error('Error loading career:', error);
        alert('Error loading career details.');
    }
}

// Delete career
async function deleteCareer(id) {
    if (!confirm('Are you sure you want to delete this career posting?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/careers/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            loadCareers();
            alert('Career deleted successfully!');
        } else {
            const error = await response.json();
            alert('Error: ' + (error.message || 'Delete failed'));
        }
    } catch (error) {
        console.error('Error deleting career:', error);
        alert('Network error. Please try again.');
    }
}

// Initialize
loadCareers();
loadApplications();
window.reviewApplication = reviewApplication;
