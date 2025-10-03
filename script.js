// ========================================
// DAILY EXPENSE TRACKER - SESSION ONLY
// No localStorage - Data cleared on close
// ========================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log(' Daily Expense Tracker Initialized');
    console.log('Security Mode: Session-only (No data persistence)');
    
    // ========================================
    // DOM ELEMENT REFERENCES
    // ========================================
    const expenseForm = document.getElementById('expenseForm');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const dateInput = document.getElementById('date');
    const totalAmount = document.getElementById('totalAmount');
    const expenseList = document.getElementById('expenseList');
    
    // Validate that all elements exist
    if (!expenseForm || !descriptionInput || !amountInput || !dateInput || !totalAmount || !expenseList) {
        console.error(' Critical elements not found!');
        alert('Error: Unable to initialize app. Please refresh the page.');
        return;
    }
    
    console.log(' All DOM elements loaded successfully');
    
    // ========================================
    // DATA STORAGE (SESSION ONLY)
    // ========================================
    // This array exists only in memory during the browser session
    // It will be completely cleared when the tab/window is closed
    let expenses = [];
    
    // ========================================
    // INITIALIZATION
    // ========================================
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    console.log(' Default date set to:', today);
    
    // Focus on description input for better UX
    descriptionInput.focus();
    
    // Initial display update
    updateDisplay();
    
    // Show session warning on page load
    showSessionWarning();
    
    // ========================================
    // EVENT LISTENERS
    // ========================================
    
    // Handle form submission
    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log(' Form submitted');
        
        // Get form values
        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const date = dateInput.value;
        
        // Validate inputs
        if (!validateExpense(description, amount, date)) {
            return;
        }
        
        // Create expense object
        const newExpense = {
            id: Date.now(), // Unique ID based on timestamp
            description: description,
            amount: amount,
            date: date,
            timestamp: new Date().toISOString(),
            displayDate: formatDate(date)
        };
        
        // Add to expenses array
        expenses.push(newExpense);
        console.log(' Expense added:', newExpense);
        console.log(' Total expenses in session:', expenses.length);
        
        // Clear form
        clearForm();
        
        // Update display
        updateDisplay();
        
        // Show success notification
        showNotification('✅ Expense added successfully!', 'success');
        
        // Log current total
        const currentTotal = calculateTotal();
        console.log(' Current total:', `$${currentTotal.toFixed(2)}`);
    });
    
    // Keyboard shortcut: Ctrl/Cmd + Enter to submit
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (descriptionInput.value.trim() && amountInput.value) {
                expenseForm.dispatchEvent(new Event('submit'));
            }
        }
    });
    
    // Auto-format amount input to 2 decimal places
    amountInput.addEventListener('blur', function() {
        if (this.value) {
            const value = parseFloat(this.value);
            if (!isNaN(value)) {
                this.value = value.toFixed(2);
            }
        }
    });
    
    // Warn user before leaving page if expenses exist
    window.addEventListener('beforeunload', function(e) {
        if (expenses.length > 0) {
            e.preventDefault();
            e.returnValue = 'You have expenses tracked. All data will be lost when you close this page. Are you sure?';
            return e.returnValue;
        }
    });
    
    // ========================================
    // CORE FUNCTIONS
    // ========================================
    
    /**
     * Validate expense input
     * @param {string} description - Expense description
     * @param {number} amount - Expense amount
     * @param {string} date - Expense date
     * @returns {boolean} - True if valid, false otherwise
     */
    function validateExpense(description, amount, date) {
        // Check description
        if (!description || description.length === 0) {
            showNotification(' Please enter a description', 'error');
            descriptionInput.focus();
            return false;
        }
        
        if (description.length > 100) {
            showNotification(' Description too long (max 100 characters)', 'error');
            descriptionInput.focus();
            return false;
        }
        
        // Check amount
        if (isNaN(amount) || amount <= 0) {
            showNotification(' Please enter a valid amount greater than 0', 'error');
            amountInput.focus();
            return false;
        }
        
        if (amount > 999999.99) {
            showNotification('Amount is too large', 'error');
            amountInput.focus();
            return false;
        }
        
        // Check date
        if (!date) {
            showNotification(' Please select a date', 'error');
            dateInput.focus();
            return false;
        }
        
        // Check if date is in the future
        const selectedDate = new Date(date);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        if (selectedDate >= tomorrow) {
            showNotification(' Date cannot be in the future', 'error');
            dateInput.focus();
            return false;
        }
        
        console.log(' Validation passed');
        return true;
    }
    
    /**
     * Clear the expense form
     */
    function clearForm() {
        descriptionInput.value = '';
        amountInput.value = '';
        dateInput.value = new Date().toISOString().split('T')[0];
        descriptionInput.focus();
        console.log(' Form cleared');
    }
    
    /**
     * Calculate total of all expenses
     * @returns {number} - Total amount
     */
    function calculateTotal() {
        return expenses.reduce((total, expense) => total + expense.amount, 0);
    }
    
    /**
     * Update all display elements
     */
    function updateDisplay() {
        updateTotalDisplay();
        displayExpensesList();
        console.log(' Display updated');
    }
    
    /**
     * Update the total amount display
     */
    function updateTotalDisplay() {
        const total = calculateTotal();
        totalAmount.textContent = `$${total.toFixed(2)}`;
        
        // Add animation class
        totalAmount.classList.add('updated');
        setTimeout(() => totalAmount.classList.remove('updated'), 300);
        
        console.log(' Total display updated:', `$${total.toFixed(2)}`);
    }
    
    /**
     * Display all expenses in the list
     */
    function displayExpensesList() {
        // Check if expenses exist
        if (expenses.length === 0) {
            expenseList.innerHTML = `
                <p class="empty-state">
                     No expenses added yet.<br>Start tracking your spending!
                </p>
            `;
            console.log(' Displaying empty state');
            return;
        }
        
        // Sort expenses by date (newest first), then by timestamp
        const sortedExpenses = [...expenses].sort((a, b) => {
            const dateComparison = new Date(b.date) - new Date(a.date);
            if (dateComparison !== 0) {
                return dateComparison;
            }
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        // Generate HTML for each expense
        expenseList.innerHTML = sortedExpenses.map(expense => {
            return createExpenseHTML(expense);
        }).join('');
        
        console.log(` Displayed ${expenses.length} expense(s)`);
    }
    
    /**
     * Create HTML for a single expense item
     * @param {Object} expense - Expense object
     * @returns {string} - HTML string
     */
    function createExpenseHTML(expense) {
        const safeDescription = escapeHtml(expense.description);
        const formattedAmount = expense.amount.toFixed(2);
        const formattedDate = formatDate(expense.date);
        
        return `
            <div class="expense-item" data-expense-id="${expense.id}">
                <div class="expense-info">
                    <div class="expense-desc">${safeDescription}</div>
                    <div class="expense-date"> ${formattedDate}</div>
                </div>
                <div class="expense-amount">$${formattedAmount}</div>
                <button class="btn-delete" onclick="deleteExpense(${expense.id})" title="Delete this expense">
                    Delete
                </button>
            </div>
        `;
    }
    
    /**
     * Delete an expense by ID
     * @param {number} id - Expense ID to delete
     */
    window.deleteExpense = function(id) {
        console.log('Attempting to delete expense:', id);
        
        // Find the expense
        const expense = expenses.find(e => e.id === id);
        
        if (!expense) {
            console.error('Expense not found:', id);
            showNotification('Error: Expense not found', 'error');
            return;
        }
        
        // Confirm deletion
        const confirmMessage = `Delete expense: "${expense.description}" ($${expense.amount.toFixed(2)})?`;
        if (!confirm(confirmMessage)) {
            console.log('Deletion cancelled by user');
            return;
        }
        
        // Remove from array
        const initialLength = expenses.length;
        expenses = expenses.filter(e => e.id !== id);
        
        if (expenses.length < initialLength) {
            console.log(' Expense deleted:', expense);
            console.log('Remaining expenses:', expenses.length);
            
            // Update display
            updateDisplay();
            
            // Show notification
            showNotification('Expense deleted', 'success');
        } else {
            console.error(' Failed to delete expense');
            showNotification(' Failed to delete expense', 'error');
        }
    };
    
    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    
    /**
     * Format date for display
     * @param {string} dateString - Date in YYYY-MM-DD format
     * @returns {string} - Formatted date string
     */
    function formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00'); // Ensure local timezone
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const expenseDate = new Date(date);
        expenseDate.setHours(0, 0, 0, 0);
        
        // Check if it's today
        if (expenseDate.getTime() === today.getTime()) {
            return 'Today';
        }
        
        // Check if it's yesterday
        if (expenseDate.getTime() === yesterday.getTime()) {
            return 'Yesterday';
        }
        
        // Format as "Mon, Jan 15, 2024"
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
    
    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Show notification message
     * @param {string} message - Message to display
     * @param {string} type - Type of notification (success, error, info)
     */
    function showNotification(message, type = 'info') {
        console.log(`📢 Notification (${type}):`, message);
        
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Set background color based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 16px 24px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            font-weight: 600;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        // Add animation styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                .total-amount.updated {
                    animation: pulse 0.3s ease-out;
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    /**
     * Show session warning on page load
     */
    function showSessionWarning() {
        setTimeout(() => {
            showNotification('Data is not saved! All expenses will be cleared when you close this page.', 'warning');
        }, 1000);
    }
    
    /**
     * Get expense statistics
     * @returns {Object} - Statistics object
     */
    function getStatistics() {
        const stats = {
            totalExpenses: expenses.length,
            totalAmount: calculateTotal(),
            averageExpense: expenses.length > 0 ? calculateTotal() / expenses.length : 0,
            highestExpense: expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0,
            lowestExpense: expenses.length > 0 ? Math.min(...expenses.map(e => e.amount)) : 0,
            todayExpenses: expenses.filter(e => formatDate(e.date) === 'Today').length,
            todayTotal: expenses
                .filter(e => formatDate(e.date) === 'Today')
                .reduce((sum, e) => sum + e.amount, 0)
        };
        
        return stats;
    }
    
    // Log statistics every 30 seconds for debugging
    setInterval(() => {
        if (expenses.length > 0) {
            const stats = getStatistics();
            console.log(' Session Statistics:', stats);
        }
    }, 30000);
    
    // ========================================
    // CONSOLE COMMANDS FOR DEBUGGING
    // ========================================
    
    // Expose utility functions to console for debugging
    window.expenseTracker = {
        getExpenses: () => expenses,
        getStats: () => getStatistics(),
        clearAll: () => {
            if (confirm('Clear all expenses? This cannot be undone!')) {
                expenses = [];
                updateDisplay();
                showNotification(' All expenses cleared', 'info');
            }
        },
        exportData: () => {
            const data = {
                expenses: expenses,
                stats: getStatistics(),
                exportDate: new Date().toISOString()
            };
            console.log(' Export Data:', JSON.stringify(data, null, 2));
            return data;
        }
    };
    
    // ========================================
    // INITIALIZATION COMPLETE
    // ========================================
    
    console.log(' Expense Tracker fully initialized and ready to use!');
    console.log('Pro tip: Use Ctrl/Cmd + Enter to quickly add expenses');
    console.log(' Debug commands available via window.expenseTracker');
    console.log('   - expenseTracker.getExpenses() - View all expenses');
    console.log('   - expenseTracker.getStats() - View statistics');
    console.log('   - expenseTracker.clearAll() - Clear all expenses');
    console.log('   - expenseTracker.exportData() - Export expense data');
});