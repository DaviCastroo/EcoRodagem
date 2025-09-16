// EcoRodagem - Main JavaScript
// Sistema completo de interações e funcionalidades

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
    initializeMasks();
    initializeValidation();
}

// Navigation Management
function initializeNavigation() {
    // Sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const currentPath = window.location.pathname;

    sidebarLinks.forEach(link => {
        // Highlight current page
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }

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
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('translate-x-0');
            sidebar.classList.toggle('-translate-x-full');
            sidebarOverlay.classList.toggle('hidden');
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.add('-translate-x-full');
            sidebar.classList.remove('translate-x-0');
            this.classList.add('hidden');
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

    if (backToList) {
        backToList.addEventListener('click', function() {
            hideForm(addVehicleForm, vehiclesList);
        });
    }

    if (cancelForm) {
        cancelForm.addEventListener('click', function() {
            hideForm(addVehicleForm, vehiclesList);
        });
    }

    // Form submission with loading state
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                showLoading(submitBtn);
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Salvando...';
            }

            if (!validateForm(this)) {
                e.preventDefault();
                if (submitBtn) {
                    hideLoading(submitBtn);
                    submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Salvar Veículo';
                }
            }
        });
    });
}

// Show/Hide Forms with Animation
function showForm(listElement, formElement) {
    listElement.classList.add('hidden');
    formElement.classList.remove('hidden');

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Focus first input
    const firstInput = formElement.querySelector('input, select, textarea');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 300);
    }
}

function hideForm(formElement, listElement) {
    formElement.classList.add('hidden');
    listElement.classList.remove('hidden');

    // Reset form
    const form = formElement.querySelector('form');
    if (form) {
        form.reset();
        clearFormErrors(form);
    }
}

// Input Masks
function initializeMasks() {
    // Plate mask
    const plateInputs = document.querySelectorAll('input[name="placa"]');
    plateInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
            if (value.length > 3) {
                value = value.substring(0, 3) + '-' + value.substring(3, 7);
            }
            e.target.value = value;
        });
    });

    // Currency mask
    const currencyInputs = document.querySelectorAll('.currency-input');
    currencyInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = (value / 100).toFixed(2);
            e.target.value = 'R$ ' + value.replace('.', ',');
        });
    });

    // Number mask
    const numberInputs = document.querySelectorAll('.number-input');
    numberInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9.,]/g, '');
        });
    });
}

// Form Validation
function initializeValidation() {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            // Clear error on input
            if (this.classList.contains('border-red-500')) {
                this.classList.remove('border-red-500');
                const errorMsg = this.parentNode.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
            }
        });
    });
}

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
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    // Clear previous errors
    clearFieldError(field);

    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Este campo é obrigatório';
    }

    // Specific validations
    if (value && isValid) {
        switch (fieldName) {
            case 'placa':
                const plateRegex = /^[A-Z]{3}-?[0-9]{4}$/;
                if (!plateRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Formato de placa inválido (ABC-1234)';
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Email inválido';
                }
                break;

            case 'hodometro':
            case 'tanque_comb':
                if (isNaN(value) || parseFloat(value) < 0) {
                    isValid = false;
                    errorMessage = 'Valor deve ser um número positivo';
                }
                break;
        }
    }

    // Show error if invalid
    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('border-red-500');

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message text-red-500 text-sm mt-1 flex items-center';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle mr-1"></i>${message}`;

    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('border-red-500');
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function clearFormErrors(form) {
    const errorMessages = form.querySelectorAll('.error-message');
    const errorFields = form.querySelectorAll('.border-red-500');

    errorMessages.forEach(msg => msg.remove());
    errorFields.forEach(field => field.classList.remove('border-red-500'));
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
            const itemName = this.dataset.name || itemType;
            showDeleteModal(itemType, itemId, itemName);
        });
    });
}

function showDeleteModal(itemType, itemId, itemName) {
    const modal = createModal({
        title: `Excluir ${itemType}`,
        message: `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`,
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
        <div class="modal-content bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 transform transition-all">
            <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 text-center mb-2">${options.title}</h3>
            <p class="text-gray-600 text-center mb-6">${options.message}</p>
            <div class="flex justify-center space-x-4">
                <button class="cancel-btn px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancelar
                </button>
                <button class="confirm-btn px-6 py-2 text-white rounded-lg transition-colors ${options.confirmClass}">
                    ${options.confirmText}
                </button>
            </div>
        </div>
    `;

    // Event listeners
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        closeModal(modal);
    });

    modal.querySelector('.confirm-btn').addEventListener('click', () => {
        if (options.onConfirm) options.onConfirm();
        closeModal(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });

    // ESC key to close
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal(modal);
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    return modal;
}

function closeModal(modal) {
    modal.style.opacity = '0';
    modal.querySelector('.modal-content').style.transform = 'scale(0.95)';
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 200);
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

function showToast(message, type = 'info', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type} fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center max-w-sm`;

    const icon = getToastIcon(type);
    toast.innerHTML = `
        <i class="${icon} mr-3 text-lg"></i>
        <span class="flex-1">${message}</span>
        <button class="ml-3 text-white hover:text-gray-200 transition-colors">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Close button
    toast.querySelector('button').addEventListener('click', () => {
        hideToast(toast);
    });

    document.body.appendChild(toast);

    // Auto-hide
    setTimeout(() => {
        hideToast(toast);
    }, duration);

    return toast;
}

function hideToast(toast) {
    if (!toast || !toast.parentNode) return;

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
            sortTable(tableId, column, this);
        });
    });
}

function filterTable(tableId, searchTerm) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    let visibleCount = 0;

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    // Show "no results" message if needed
    showNoResultsMessage(table, visibleCount === 0 && searchTerm !== '');
}

function sortTable(tableId, column, button) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const isAscending = !button.classList.contains('sort-asc');

    // Update sort indicators
    table.querySelectorAll('[data-sort]').forEach(btn => {
        btn.classList.remove('sort-asc', 'sort-desc');
        btn.querySelector('i').className = 'fas fa-sort text-xs';
    });

    button.classList.add(isAscending ? 'sort-asc' : 'sort-desc');
    button.querySelector('i').className = `fas fa-sort-${isAscending ? 'up' : 'down'} text-xs`;

    rows.sort((a, b) => {
        const aValue = a.querySelector(`[data-column="${column}"]`)?.textContent.trim() || '';
        const bValue = b.querySelector(`[data-column="${column}"]`)?.textContent.trim() || '';

        const comparison = aValue.localeCompare(bValue, 'pt-BR', { numeric: true });
        return isAscending ? comparison : -comparison;
    });

    rows.forEach(row => tbody.appendChild(row));
}

function showNoResultsMessage(table, show) {
    let noResultsRow = table.querySelector('.no-results-row');

    if (show && !noResultsRow) {
        const tbody = table.querySelector('tbody');
        const colCount = table.querySelectorAll('thead th').length;

        noResultsRow = document.createElement('tr');
        noResultsRow.className = 'no-results-row';
        noResultsRow.innerHTML = `
            <td colspan="${colCount}" class="px-6 py-8 text-center text-gray-500">
                <i class="fas fa-search text-3xl mb-2 block"></i>
                Nenhum resultado encontrado
            </td>
        `;

        tbody.appendChild(noResultsRow);
    } else if (!show && noResultsRow) {
        noResultsRow.remove();
    }
}

// Charts Initialization
function initializeCharts() {
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
            // Remove row from table or reload page
            const row = document.querySelector(`[data-id="${itemId}"]`)?.closest('tr');
            if (row) {
                row.style.opacity = '0';
                setTimeout(() => row.remove(), 300);
            } else {
                setTimeout(() => location.reload(), 1000);
            }
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

// Auto-save functionality
function initializeAutoSave() {
    const forms = document.querySelectorAll('[data-autosave]');

    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            input.addEventListener('change', function() {
                debounce(() => {
                    saveFormData(form);
                }, 1000)();
            });
        });
    });
}

function saveFormData(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    localStorage.setItem(`form_${form.id}`, JSON.stringify(data));
    showToast('Dados salvos automaticamente', 'info', 2000);
}

function loadFormData(form) {
    const savedData = localStorage.getItem(`form_${form.id}`);

    if (savedData) {
        const data = JSON.parse(savedData);

        Object.keys(data).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = data[key];
            }
        });
    }
}

// Debounce utility
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

// Keyboard shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('[data-search]');
            if (searchInput) {
                searchInput.focus();
            }
        }

        // Ctrl/Cmd + N for new item
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            const addButton = document.getElementById('addVehicleBtn');
            if (addButton) {
                addButton.click();
            }
        }
    });
}

// Initialize keyboard shortcuts
document.addEventListener('DOMContentLoaded', function() {
    initializeKeyboardShortcuts();
    initializeAutoSave();
});

// Export functions for global use
window.EcoRodagem = {
    showToast,
    showDeleteModal,
    formatCurrency,
    formatDate,
    formatNumber,
    makeRequest,
    showLoading,
    hideLoading,
    validateForm,
    validateField,
    showForm,
    hideForm
};