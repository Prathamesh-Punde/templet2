// API Configuration
const API_URL = '/api';

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Format date to relative time
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
}

// Format requirements and responsibilities as HTML list
function formatList(text) {
    if (!text) return '';
    
    // If already contains HTML, return as is
    if (text.includes('<ul>') || text.includes('<li>')) {
        return text;
    }
    
    // Split by newlines and create list items
    const items = text.split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .map(item => {
            // Remove bullet points or dashes at the start
            item = item.replace(/^[-•*]\s*/, '');
            return `<li>${item}</li>`;
        })
        .join('');
    
    return items ? `<ul>${items}</ul>` : text;
}

function openApplicationModal(jobId, jobTitle) {
    document.getElementById('careerId').value = jobId;
    document.getElementById('applicationJobTitle').textContent = `Position: ${jobTitle}`;
    document.getElementById('applicationMessage').style.display = 'none';
    document.getElementById('applicationForm').reset();
    document.getElementById('careerId').value = jobId;

    const modal = document.getElementById('applicationModal');
    modal.style.display = 'flex';
}

function closeApplicationModal() {
    const modal = document.getElementById('applicationModal');
    modal.style.display = 'none';
}

// Load active job postings from backend
async function loadJobPostings() {
    const positionsList = document.querySelector('.positions-list');
    
    // Show loading state
    positionsList.innerHTML = `
        <div style="text-align: center; padding: 60px; color: #7f8c8d;">
            <i class="fas fa-spinner fa-spin" style="font-size: 48px; margin-bottom: 20px;"></i>
            <p style="font-size: 18px;">Loading job openings...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/careers/active`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.careers && data.careers.length > 0) {
            positionsList.innerHTML = data.careers.map(job => `
                <div class="position-card">
                    <div class="position-header">
                        <div>
                            <h3>${escapeHtml(job.job_title)}</h3>
                            <div class="position-meta">
                                <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(job.location || 'Location not specified')}</span>
                                <span><i class="fas fa-briefcase"></i> ${escapeHtml(job.employment_type || 'Full-time')}</span>
                                <span><i class="fas fa-clock"></i> Posted ${formatDate(job.created_at)}</span>
                            </div>
                        </div>
                        ${job.created_at && (new Date() - new Date(job.created_at)) < 7 * 24 * 60 * 60 * 1000 
                            ? '<span class="position-badge">New</span>' 
                            : ''}
                    </div>
                    <p class="position-description">${escapeHtml(job.description || 'No description available.')}</p>
                    ${job.requirements ? `
                        <div class="position-requirements">
                            <h4>Requirements:</h4>
                            ${formatList(job.requirements)}
                        </div>
                    ` : ''}
                    ${job.responsibilities ? `
                        <div class="position-requirements">
                            <h4>Responsibilities:</h4>
                            ${formatList(job.responsibilities)}
                        </div>
                    ` : ''}
                    <div class="position-footer">
                        ${job.salary_range ? `
                            <div class="position-salary">
                                <i class="fas fa-rupee-sign"></i>
                                <span>${escapeHtml(job.salary_range)}</span>
                            </div>
                        ` : '<div></div>'}
                        <button type="button" class="btn btn-primary" onclick="openApplicationModal(${job.id}, '${String(job.job_title).replace(/'/g, "\\'")}')">Apply Now</button>
                    </div>
                </div>
            `).join('');
        } else {
            positionsList.innerHTML = `
                <div style="text-align: center; padding: 60px;">
                    <i class="fas fa-briefcase" style="font-size: 64px; color: #bdc3c7; margin-bottom: 20px;"></i>
                    <h3 style="color: #2c3e50; margin-bottom: 10px;">No Open Positions</h3>
                    <p style="color: #7f8c8d;">We don't have any open positions at the moment.</p>
                    <p style="color: #7f8c8d;">Please check back soon or contact us for future opportunities!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading job postings:', error);
        positionsList.innerHTML = `
            <div style="text-align: center; padding: 60px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 64px; color: #e74c3c; margin-bottom: 20px;"></i>
                <h3 style="color: #2c3e50; margin-bottom: 10px;">Unable to Load Positions</h3>
                <p style="color: #7f8c8d; margin-bottom: 20px;">
                    ${error.message.includes('Failed to fetch') 
                        ? 'Cannot connect to the server. Please make sure the backend is running.' 
                        : 'An error occurred while loading job openings.'}
                </p>
                <button onclick="loadJobPostings()" class="btn btn-primary">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
}

document.getElementById('cancelApplicationBtn').addEventListener('click', closeApplicationModal);

document.getElementById('applicationModal').addEventListener('click', (e) => {
    if (e.target.id === 'applicationModal') {
        closeApplicationModal();
    }
});

document.getElementById('applicationForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const careerId = document.getElementById('careerId').value;
    const submitBtn = document.getElementById('submitApplicationBtn');
    const messageBox = document.getElementById('applicationMessage');

    const payload = {
        candidate_name: document.getElementById('candidateName').value.trim(),
        candidate_email: document.getElementById('candidateEmail').value.trim(),
        candidate_phone: document.getElementById('candidatePhone').value.trim(),
        years_of_experience: document.getElementById('candidateExperience').value,
        current_location: document.getElementById('candidateLocation').value.trim(),
        resume_link: document.getElementById('resumeLink').value.trim(),
        cover_letter: document.getElementById('coverLetter').value.trim()
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        const response = await fetch(`${API_URL}/careers/${careerId}/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to submit application');
        }

        messageBox.style.display = 'block';
        messageBox.style.color = '#1e7e34';
        messageBox.textContent = 'Application submitted successfully. Our HR team will contact you soon.';

        setTimeout(() => {
            closeApplicationModal();
        }, 1200);
    } catch (error) {
        messageBox.style.display = 'block';
        messageBox.style.color = '#c82333';
        messageBox.textContent = error.message;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
    }
});

window.openApplicationModal = openApplicationModal;

// Load on page load
document.addEventListener('DOMContentLoaded', loadJobPostings);
