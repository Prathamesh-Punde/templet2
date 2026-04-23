const API_URL = '/api';
const token = localStorage.getItem('token');
let currentCustomers = [];

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
    return new Date(value).toLocaleDateString();
}

async function loadCustomers() {
    try {
        const response = await fetch(`${API_URL}/customers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        const tbody = document.getElementById('customersTableBody');
        currentCustomers = data.customers || [];

        if (currentCustomers.length > 0) {
            tbody.innerHTML = currentCustomers.map((customer) => `
                <tr>
                    <td>${escapeHtml(customer.customer_id)}</td>
                    <td>${escapeHtml(customer.customer_name)}</td>
                    <td>${escapeHtml(customer.product)}</td>
                    <td>${escapeHtml(customer.mobile_no)}</td>
                    <td>${formatDate(customer.purchase_date)}</td>
                    <td>${escapeHtml(customer.notes || '-')}</td>
                    <td>
                        <button class="btn btn-warning" onclick="editCustomer(${customer.id})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteCustomer(${customer.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No customers found. Add your first customer.</td></tr>';
        }
    } catch (error) {
        console.error('Error loading customers:', error);
        document.getElementById('customersTableBody').innerHTML =
            '<tr><td colspan="7" class="empty-state">Error loading customers. Please try again.</td></tr>';
    }
}

function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add New Customer';
    document.getElementById('customerForm').reset();
    document.getElementById('customerRowId').value = '';
    document.getElementById('customer_id').value = 'Auto generated on save';
    document.getElementById('customerModal').classList.add('show');
}

function closeModal() {
    document.getElementById('customerModal').classList.remove('show');
}

function editCustomer(id) {
    const customer = currentCustomers.find((item) => item.id === id);
    if (!customer) {
        alert('Customer not found.');
        return;
    }

    document.getElementById('modalTitle').textContent = 'Edit Customer';
    document.getElementById('customerRowId').value = customer.id;
    document.getElementById('customer_id').value = customer.customer_id;
    document.getElementById('customer_name').value = customer.customer_name;
    document.getElementById('product').value = customer.product;
    document.getElementById('mobile_no').value = customer.mobile_no;
    document.getElementById('purchase_date').value = customer.purchase_date ? customer.purchase_date.substring(0, 10) : '';
    document.getElementById('notes').value = customer.notes || '';
    document.getElementById('customerModal').classList.add('show');
}

async function deleteCustomer(id) {
    if (!confirm('Delete this customer record?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/customers/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            alert('Error: ' + (error.message || 'Delete failed'));
            return;
        }

        loadCustomers();
        alert('Customer deleted successfully!');
    } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Network error. Please try again.');
    }
}

document.getElementById('addCustomerBtn').addEventListener('click', openAddModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);

document.getElementById('customerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const rowId = document.getElementById('customerRowId').value;
    const payload = {
        customer_name: document.getElementById('customer_name').value.trim(),
        product: document.getElementById('product').value.trim(),
        mobile_no: document.getElementById('mobile_no').value.trim(),
        purchase_date: document.getElementById('purchase_date').value,
        notes: document.getElementById('notes').value.trim()
    };

    try {
        const response = await fetch(
            rowId ? `${API_URL}/customers/${rowId}` : `${API_URL}/customers`,
            {
                method: rowId ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            const error = await response.json();
            alert('Error: ' + (error.message || 'Save failed'));
            return;
        }

        closeModal();
        loadCustomers();
        alert(rowId ? 'Customer updated successfully!' : 'Customer added successfully!');
    } catch (error) {
        console.error('Error saving customer:', error);
        alert('Network error. Please try again.');
    }
});

window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;

loadCustomers();
