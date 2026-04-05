// API Configuration
const API_URL = '/api';
const token = localStorage.getItem('token');

let currentEnquiryId = null;

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleString();
}

function formatTime(value) {
    if (!value) return '-';
    return value;
}

function getStatusLabel(status) {
    return (status || 'new').replace(/_/g, ' ').toUpperCase();
}

async function loadEnquiries() {
    try {
        const status = document.getElementById('statusFilter').value;
        let url = `${API_URL}/enquiries`;

        if (status) {
            url += `?status=${encodeURIComponent(status)}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        const tbody = document.getElementById('enquiriesTableBody');

        if (data.enquiries && data.enquiries.length > 0) {
            tbody.innerHTML = data.enquiries.map(enquiry => `
                <tr>
                    <td>${escapeHtml(enquiry.full_name)}</td>
                    <td>
                        ${escapeHtml(enquiry.email)}<br>
                        <small>${escapeHtml(enquiry.phone || '-')}</small>
                    </td>
                    <td>
                        ${escapeHtml(enquiry.subject)}<br>
                        <small>${escapeHtml(enquiry.service || '-')}</small>
                    </td>
                    <td>
                        <span class="status-badge status-${enquiry.status}">${getStatusLabel(enquiry.status)}</span>
                    </td>
                    <td>${formatTime(enquiry.call_time)}</td>
                    <td>${enquiry.next_followup_date ? new Date(enquiry.next_followup_date).toLocaleDateString() : '-'}</td>
                    <td>${escapeHtml(enquiry.handled_by_name || '-')}</td>
                    <td>${formatDate(enquiry.created_at)}</td>
                    <td>
                        <button class="btn btn-primary" onclick="viewEnquiry(${enquiry.id})">View / Update</button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No enquiries found.</td></tr>';
        }
    } catch (error) {
        console.error('Error loading enquiries:', error);
        document.getElementById('enquiriesTableBody').innerHTML = '<tr><td colspan="9" class="empty-state">Error loading enquiries. Please try again.</td></tr>';
    }
}

async function viewEnquiry(id) {
    currentEnquiryId = id;

    try {
        const response = await fetch(`${API_URL}/enquiries/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        const enquiry = data.enquiry;

        document.getElementById('enquiryId').value = enquiry.id;
        document.getElementById('call_time').value = enquiry.call_time || '';
        document.getElementById('status').value = enquiry.status || 'new';
        document.getElementById('comments').value = enquiry.comments || '';
        document.getElementById('next_followup_date').value = enquiry.next_followup_date ? enquiry.next_followup_date.substring(0, 10) : '';
        document.getElementById('nextFollowUpGroup').style.display = enquiry.status === 'asked_for_next_followup' ? 'block' : 'none';
        toggleNextFollowUpField();

        document.getElementById('enquiryDetails').innerHTML = `
            <div class="detail-grid">
                <div class="detail-box">
                    <span class="label">Customer Name</span>
                    <div class="value">${escapeHtml(enquiry.full_name)}</div>
                </div>
                <div class="detail-box">
                    <span class="label">Email</span>
                    <div class="value">${escapeHtml(enquiry.email)}</div>
                </div>
                <div class="detail-box">
                    <span class="label">Phone</span>
                    <div class="value">${escapeHtml(enquiry.phone || '-')}</div>
                </div>
                <div class="detail-box">
                    <span class="label">Subject</span>
                    <div class="value">${escapeHtml(enquiry.subject)}</div>
                </div>
                <div class="detail-box">
                    <span class="label">Service</span>
                    <div class="value">${escapeHtml(enquiry.service || '-')}</div>
                </div>
                <div class="detail-box">
                    <span class="label">Status</span>
                    <div class="value"><span class="status-badge status-${enquiry.status}">${getStatusLabel(enquiry.status)}</span></div>
                </div>
                <div class="detail-box">
                    <span class="label">Created</span>
                    <div class="value">${formatDate(enquiry.created_at)}</div>
                </div>
                <div class="detail-box">
                    <span class="label">Handled By</span>
                    <div class="value">${escapeHtml(enquiry.handled_by_name || '-')}</div>
                </div>
            </div>
            <div class="detail-box" style="margin-bottom: 16px;">
                <span class="label">Message</span>
                <div class="value">${escapeHtml(enquiry.message)}</div>
            </div>
            <div class="detail-box">
                <span class="label">Current Comments</span>
                <div class="value">${escapeHtml(enquiry.comments || '-')}</div>
            </div>
        `;

        document.getElementById('enquiryModal').classList.add('show');
    } catch (error) {
        console.error('Error loading enquiry:', error);
        alert('Error loading enquiry details.');
    }
}

function toggleNextFollowUpField() {
    const status = document.getElementById('status').value;
    const group = document.getElementById('nextFollowUpGroup');
    const input = document.getElementById('next_followup_date');

    if (status === 'asked_for_next_followup') {
        group.style.display = 'block';
        input.required = true;
    } else {
        group.style.display = 'none';
        input.required = false;
        input.value = '';
    }
}

document.getElementById('status').addEventListener('change', toggleNextFollowUpField);
document.getElementById('statusFilter').addEventListener('change', loadEnquiries);
document.getElementById('refreshBtn').addEventListener('click', loadEnquiries);
document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('enquiryModal').classList.remove('show');
});

document.getElementById('enquiryForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const status = document.getElementById('status').value;
    const payload = {
        call_time: document.getElementById('call_time').value,
        status,
        comments: document.getElementById('comments').value,
        next_followup_date: document.getElementById('next_followup_date').value || null
    };

    try {
        const response = await fetch(`${API_URL}/enquiries/${currentEnquiryId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            document.getElementById('enquiryModal').classList.remove('show');
            loadEnquiries();
            alert('Enquiry updated successfully!');
        } else {
            const error = await response.json();
            alert('Error: ' + (error.message || 'Update failed'));
        }
    } catch (error) {
        console.error('Error updating enquiry:', error);
        alert('Network error. Please try again.');
    }
});

loadEnquiries();
