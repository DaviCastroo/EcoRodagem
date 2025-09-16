# Criar arquivo main.js
main_js_content = """// EcoRodagem - Main JavaScript

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    initializeNavigation();
    initializeForms();
    initializeModals();
    initializeToasts();
    initializeTables();
    initializeCharts();
}

// Navigation Management
function initializeNavigation() {
    // Sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all links
            sidebarLinks.forEach(l => {
                l.classList.remove('active');
            });

            // Add active class to clicked link
            this.classList.add('active');
        });
    });

    // Mobile sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
    }
}

// Form Management
function initializeForms() {
    // Vehicle form toggle
    const addVehicleBtn = document.getElementById('addVehicleBtn');
    const vehiclesList = document.getElementById('vehicles-list');
    const addVehicleForm = document.getElementById('add-vehicle-form');
    const backToList = document.getElementById('backToList');
    const cancelForm = document.getElementById('cancelForm');

    if (addVehicleBtn && vehiclesList && addVehicleForm) {
        addVehicleBtn.addEventListener('click', function() {
            showForm(vehiclesList, addVehicleForm);
        });
    }

    if (backToList && cancelForm) {
        backToList.addEventListener('click', function() {
            hideForm(addVehicleForm, vehiclesList);
        });

        cancelForm.addEventListener('click', function() {
            hideForm(addVehicleForm, vehiclesList);
        });
    }

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
    });

    // Real-time validation
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

// Show/Hide Forms
function showForm(listElement, formElement) {
    listElement.classList.add('hidden');
    formElement.classList.remove('hidden');
    formElement.classList.add('fade-in');
}

function hideForm(formElement, listElement) {
    formElement.classList.add('hidden');
    listElement.classList.remove('hidden');
    listElement.classList.add('fade-in');
}

// Form Validation
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    let isValid = true;
    let errorMessage = '';

    // Remove previous error styling
    field.classList.remove('border-red-500');
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Este campo é obrigatório';
    }

    // Email validation
    if (fieldType === 'email' && value) {
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Email inválido';
        }
    }

    // Number validation
    if (fieldType === 'number' && value) {
        if (isNaN(value) || parseFloat(value) < 0) {
            isValid = false;
            errorMessage = 'Número inválido';
        }
    }

    // Plate validation (Brazilian format)
    if (field.name === 'placa' && value) {
        const plateRegex = /^[A-Z]{3}-?\\d{4}$/i;
        if (!plateRegex.test(value)) {
            isValid = false;
            errorMessage = 'Formato de placa inválido (ABC-1234)';
        }
    }

    // Show error if invalid
    if (!isValid) {
        field.classList.add('border-red-500');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-red-500 text-sm mt-1';
        errorDiv.textContent = errorMessage;
        field.parentNode.appendChild(errorDiv);
    }

    return isValid;
}

// Modal Management
function initializeModals() {
    // Delete confirmation modals
    const deleteButtons = document.querySelectorAll('[data-delete]');

    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const itemType = this.dataset.delete;
            const itemId = this.dataset.id;
            showDeleteModal(itemType, itemId);
        });
    });
}

function showDeleteModal(itemType, itemId) {
    const modal = createModal({
        title: `Excluir ${itemType}`,
        message: `Tem certeza que deseja excluir este ${itemType}? Esta ação não pode ser desfeita.`,
        confirmText: 'Excluir',
        confirmClass: 'bg-red-500 hover:bg-red-600',
        onConfirm: () => deleteItem(itemType, itemId)
    });

    document.body.appendChild(modal);
}

function createModal(options) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

    modal.innerHTML = `
        <div class="modal-content bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">${options.title}</h3>
            <p class="text-gray-600 mb-6">${options.message}</p>
            <div class="flex justify-end space-x-4">
                <button class="cancel-btn px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Cancelar
                </button>
                <button class="confirm-btn px-4 py-2 text-white rounded-lg ${options.confirmClass}">
                    ${options.confirmText}
                </button>
            </div>
        </div>
    `;

    // Event listeners
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.remove();
    });

    modal.querySelector('.confirm-btn').addEventListener('click', () => {
        if (options.onConfirm) options.onConfirm();
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    return modal;
}

// Toast Notifications
function initializeToasts() {
    // Auto-hide existing toasts
    const toasts = document.querySelectorAll('.toast');
    toasts.forEach(toast => {
        setTimeout(() => {
            hideToast(toast);
        }, 5000);
    });
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type} fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center`;

    const icon = getToastIcon(type);
    toast.innerHTML = `
        <i class="${icon} mr-2"></i>
        <span>${message}</span>
        <button class="ml-4 text-white hover:text-gray-200">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Close button
    toast.querySelector('button').addEventListener('click', () => {
        hideToast(toast);
    });

    document.body.appendChild(toast);

    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideToast(toast);
    }, 5000);
}

function hideToast(toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 300);
}

function getToastIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
}

// Table Management
function initializeTables() {
    // Search functionality
    const searchInputs = document.querySelectorAll('[data-search]');

    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const tableId = this.dataset.search;
            const searchTerm = this.value.toLowerCase();
            filterTable(tableId, searchTerm);
        });
    });

    // Sort functionality
    const sortButtons = document.querySelectorAll('[data-sort]');

    sortButtons.forEach(button => {
        button.addEventListener('click', function() {
            const column = this.dataset.sort;
            const tableId = this.dataset.table;
            sortTable(tableId, column);
        });
    });
}

function filterTable(tableId, searchTerm) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function sortTable(tableId, column) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
        const aValue = a.querySelector(`[data-column="${column}"]`).textContent;
        const bValue = b.querySelector(`[data-column="${column}"]`).textContent;

        return aValue.localeCompare(bValue);
    });

    rows.forEach(row => tbody.appendChild(row));
}

// Charts Initialization
function initializeCharts() {
    // This will be handled by charts.js
    if (typeof initializeDashboardCharts === 'function') {
        initializeDashboardCharts();
    }
}

// AJAX Helpers
function makeRequest(url, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        }
    };

    const finalOptions = { ...defaultOptions, ...options };

    return fetch(url, finalOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Request failed:', error);
            showToast('Erro na requisição', 'error');
            throw error;
        });
}

function getCsrfToken() {
    const token = document.querySelector('[name=csrfmiddlewaretoken]');
    return token ? token.value : '';
}

// Delete Item Function
function deleteItem(itemType, itemId) {
    const url = `/${itemType}/${itemId}/delete/`;

    makeRequest(url, { method: 'DELETE' })
        .then(data => {
            showToast(`${itemType} excluído com sucesso!`, 'success');
            // Reload page or remove item from DOM
            location.reload();
        })
        .catch(error => {
            showToast(`Erro ao excluir ${itemType}`, 'error');
        });
}

// Utility Functions
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

function formatNumber(value, decimals = 2) {
    return parseFloat(value).toFixed(decimals);
}

// Loading States
function showLoading(element) {
    element.classList.add('loading');
    element.disabled = true;
}

function hideLoading(element) {
    element.classList.remove('loading');
    element.disabled = false;
}

// Export functions for global use
window.EcoRodagem = {
    showToast,
    showDeleteModal,
    formatCurrency,
    formatDate,
    formatNumber,
    makeRequest,
    showLoading,
    hideLoading
};"""

# Salvar arquivo main.js
with open('main.js', 'w', encoding='utf-8') as f:
    f.write(main_js_content)

print("✅ Arquivo main.js criado com sucesso!")