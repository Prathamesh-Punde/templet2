// API Configuration
const API_URL = '/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

let currentTicketId = null;

// Load tickets
async function loadTickets() {
    try {
        const status = document.getElementById('statusFilter').value;
        const priority = document.getElementById('priorityFilter').value;
        
        let url = `${API_URL}/support/tickets?`;
        if (status) url += `status=${status}&`;
        if (priority) url += `priority=${priority}&`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        const tbody = document.getElementById('ticketsTableBody');
        
        if (data.tickets && data.tickets.length > 0) {
            tbody.innerHTML = data.tickets.map(ticket => {
                const createdDate = new Date(ticket.created_at).toLocaleDateString();
                return `
                    <tr>
                        <td>${ticket.ticket_number}</td>
                        <td>${ticket.customer_name}<br><small>${ticket.customer_email}</small></td>
                        <td>${ticket.subject}</td>
                        <td>
                            <span class="status-badge status-${ticket.status}">
                                ${ticket.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </td>
                        <td>
                            <span class="status-badge priority-${ticket.priority}">
                                ${ticket.priority.toUpperCase()}
                            </span>
                        </td>
                        <td>${ticket.assigned_to_name || 'Unassigned'}</td>
                        <td>${createdDate}</td>
                        <td>
                            <button class="btn btn-primary" onclick="viewTicket(${ticket.id})">View</button>
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No tickets found.</td></tr>';
        }
    } catch (error) {
        console.error('Error loading tickets:', error);
        document.getElementById('ticketsTableBody').innerHTML = 
            '<tr><td colspan="8" class="empty-state">Error loading tickets. Please try again.</td></tr>';
    }
}

// View ticket details
async function viewTicket(id) {
    currentTicketId = id;
    
    try {
        const response = await fetch(`${API_URL}/support/tickets/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        const ticket = data.ticket;
        const responses = data.responses;
        
        // Display ticket details
        document.getElementById('ticketDetails').innerHTML = `
            <h4>${ticket.ticket_number} - ${ticket.subject}</h4>
            <div class="detail-row">
                <span class="detail-label">Customer:</span>
                <span>${ticket.customer_name} (${ticket.customer_email})</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Software:</span>
                <span>${ticket.subject}</span>
            </div>
            ${ticket.customer_phone ? `
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span>${ticket.customer_phone}</span>
                </div>
            ` : ''}
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="status-badge status-${ticket.status}">${ticket.status.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Priority:</span>
                <span class="status-badge priority-${ticket.priority}">${ticket.priority.toUpperCase()}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Assigned To:</span>
                <span>${ticket.assigned_to_name || 'Unassigned'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Created:</span>
                <span>${new Date(ticket.created_at).toLocaleString()}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Message:</span>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 5px;">
                ${ticket.message}
            </div>
        `;
        
        // Display responses
        const responsesList = document.getElementById('responsesList');
        if (responses && responses.length > 0) {
            responsesList.innerHTML = responses.map(resp => `
                <div class="response-item">
                    <div class="response-header">
                        <strong>${resp.user_name}</strong>
                        <span>${new Date(resp.created_at).toLocaleString()}</span>
                    </div>
                    <div>${resp.response}</div>
                    ${resp.is_internal ? '<div style="color: #f39c12; font-size: 12px; margin-top: 5px;">Internal Note</div>' : ''}
                </div>
            `).join('');
        } else {
            responsesList.innerHTML = '<p style="color: #7f8c8d;">No responses yet.</p>';
        }
        
        // Update button states
        document.getElementById('assignToMeBtn').disabled = ticket.status === 'resolved';
        document.getElementById('resolveBtn').disabled = ticket.status === 'resolved';
        const deleteTicketBtn = document.getElementById('deleteTicketBtn');
        if (deleteTicketBtn) {
            deleteTicketBtn.style.display = user && user.role === 'super_admin' ? 'inline-block' : 'none';
        }
        
        document.getElementById('ticketModal').classList.add('show');
    } catch (error) {
        console.error('Error loading ticket:', error);
        alert('Error loading ticket details.');
    }
}

// Assign ticket to me
document.getElementById('assignToMeBtn').addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_URL}/support/tickets/${currentTicketId}/assign`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        
        if (response.ok) {
            alert('Ticket assigned successfully!');
            viewTicket(currentTicketId);
            loadTickets();
        } else {
            const error = await response.json();
            alert('Error: ' + (error.message || 'Assignment failed'));
        }
    } catch (error) {
        console.error('Error assigning ticket:', error);
        alert('Network error. Please try again.');
    }
});

// Resolve ticket
document.getElementById('resolveBtn').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to mark this ticket as resolved?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/support/tickets/${currentTicketId}/resolve`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            alert('Ticket resolved successfully!');
            document.getElementById('ticketModal').classList.remove('show');
            loadTickets();
        } else {
            const error = await response.json();
            alert('Error: ' + (error.message || 'Resolution failed'));
        }
    } catch (error) {
        console.error('Error resolving ticket:', error);
        alert('Network error. Please try again.');
    }
});

// Delete ticket (super admin only)
document.getElementById('deleteTicketBtn').addEventListener('click', async () => {
    if (!currentTicketId) {
        return;
    }

    if (!confirm('Are you sure you want to permanently delete this ticket?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/support/tickets/${currentTicketId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('Ticket deleted successfully!');
            document.getElementById('ticketModal').classList.remove('show');
            loadTickets();
        } else {
            const error = await response.json();
            alert('Error: ' + (error.message || 'Delete failed'));
        }
    } catch (error) {
        console.error('Error deleting ticket:', error);
        alert('Network error. Please try again.');
    }
});

// Add response
document.getElementById('responseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const responseText = document.getElementById('responseText').value;
    const isInternal = document.getElementById('isInternal').checked;
    
    try {
        const response = await fetch(`${API_URL}/support/tickets/${currentTicketId}/response`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                response: responseText,
                is_internal: isInternal
            })
        });
        
        if (response.ok) {
            document.getElementById('responseForm').reset();
            viewTicket(currentTicketId);
        } else {
            const error = await response.json();
            alert('Error: ' + (error.message || 'Failed to add response'));
        }
    } catch (error) {
        console.error('Error adding response:', error);
        alert('Network error. Please try again.');
    }
});

// Close modal
document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('ticketModal').classList.remove('show');
});

// Filters
document.getElementById('statusFilter').addEventListener('change', loadTickets);
document.getElementById('priorityFilter').addEventListener('change', loadTickets);
document.getElementById('refreshBtn').addEventListener('click', loadTickets);

// Initialize
loadTickets();
