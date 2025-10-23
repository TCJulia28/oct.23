// Transaction Manager with Voice & OCR
class TransactionManager {
    constructor() {
        this.transactions = this.loadTransactions();
        this.currentMode = null;
        this.recognition = null;
        this.currentReceiptData = null;
        this.init();
    }

    init() {
        // Quick add buttons
        document.getElementById('voiceBtn').addEventListener('click', () => this.switchMode('voice'));
        document.getElementById('cameraBtn').addEventListener('click', () => this.switchMode('camera'));
        document.getElementById('manualBtn').addEventListener('click', () => this.switchMode('manual'));

        // Voice recording
        document.getElementById('recordBtn').addEventListener('click', () => this.toggleRecording());

        // Camera
        document.getElementById('takePictureBtn').addEventListener('click', () => {
            document.getElementById('receiptCamera').click();
        });
        document.getElementById('receiptCamera').addEventListener('change', (e) => this.handleReceiptUpload(e));

        // Manual form
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransactionFromForm();
        });

        // Set today's date
        document.getElementById('date').valueAsDate = new Date();

        // Filters
        document.getElementById('filterPayment').addEventListener('change', () => this.renderTransactions());
        document.getElementById('filterCategory').addEventListener('change', () => this.renderTransactions());

        // Modal
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('receiptModal')) this.closeModal();
        });

        // Initialize speech recognition
        this.initSpeechRecognition();

        // Initial render
        this.renderTransactions();
    }

    switchMode(mode) {
        // Hide all interfaces
        document.getElementById('voiceInterface').style.display = 'none';
        document.getElementById('cameraInterface').style.display = 'none';
        document.getElementById('manualInterface').style.display = 'none';
        document.getElementById('confirmationMsg').style.display = 'none';

        // Remove active class from all buttons
        document.querySelectorAll('.quick-btn').forEach(btn => btn.classList.remove('active'));

        // Show selected interface
        if (mode === 'voice') {
            document.getElementById('voiceInterface').style.display = 'block';
            document.getElementById('voiceBtn').classList.add('active');
        } else if (mode === 'camera') {
            document.getElementById('cameraInterface').style.display = 'block';
            document.getElementById('cameraBtn').classList.add('active');
        } else if (mode === 'manual') {
            document.getElementById('manualInterface').style.display = 'block';
            document.getElementById('manualBtn').classList.add('active');
        }

        this.currentMode = mode;
    }

    // Speech Recognition
    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.processVoiceInput(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.stopRecording();
                alert('Could not recognize speech. Please try again.');
            };

            this.recognition.onend = () => {
                this.stopRecording();
            };
        }
    }

    toggleRecording() {
        const recordBtn = document.getElementById('recordBtn');
        const indicator = document.querySelector('.pulse-indicator');
        const recordingText = document.getElementById('recordingText');

        if (recordBtn.classList.contains('recording')) {
            this.recognition.stop();
        } else {
            if (!this.recognition) {
                alert('Speech recognition is not supported in your browser. Please use Chrome or Safari.');
                return;
            }
            recordBtn.classList.add('recording');
            indicator.classList.add('recording');
            recordingText.textContent = 'Listening... Speak now!';
            this.recognition.start();
        }
    }

    stopRecording() {
        const recordBtn = document.getElementById('recordBtn');
        const indicator = document.querySelector('.pulse-indicator');
        const recordingText = document.getElementById('recordingText');

        recordBtn.classList.remove('recording');
        indicator.classList.remove('recording');
        recordingText.textContent = 'Click the microphone to start recording';
    }

    processVoiceInput(transcript) {
        document.getElementById('voiceTranscript').textContent = transcript;

        // Parse the transcript
        const parsed = this.parseVoiceInput(transcript);

        if (parsed.amount && parsed.merchant) {
            this.addTransaction(parsed);
            this.showConfirmation(`Added: $${parsed.amount} at ${parsed.merchant}`);
        } else {
            alert('Could not understand. Please say something like: "Spent $25 at Starbucks with Apple Pay"');
        }
    }

    parseVoiceInput(text) {
        const transaction = {
            date: new Date().toISOString().split('T')[0],
            merchant: '',
            amount: 0,
            paymentMethod: 'Cash',
            category: 'Other',
            notes: text
        };

        // Extract amount
        const amountMatch = text.match(/\$?(\d+(?:\.\d{2})?)/);
        if (amountMatch) {
            transaction.amount = parseFloat(amountMatch[1]);
        }

        // Extract merchant (look for "at" keyword)
        const atMatch = text.match(/at\s+([a-zA-Z\s]+?)(?:\s+with|\s+using|$)/i);
        if (atMatch) {
            transaction.merchant = atMatch[1].trim();
        }

        // Extract payment method
        const paymentMethods = ['apple pay', 'zelle', 'venmo', 'cash app', 'paypal', 'credit card', 'debit card', 'cash'];
        const lowerText = text.toLowerCase();
        for (const method of paymentMethods) {
            if (lowerText.includes(method)) {
                transaction.paymentMethod = method.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                break;
            }
        }

        // Auto-categorize based on merchant
        transaction.category = this.categorizeTransaction(transaction.merchant);

        return transaction;
    }

    // Receipt OCR (Simulated - in production you'd use Tesseract.js or cloud OCR)
    async handleReceiptUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            this.currentReceiptData = e.target.result;
            document.getElementById('cameraPreview').innerHTML = `<img src="${e.target.result}" alt="Receipt">`;

            // Show analyzing text
            document.getElementById('analyzingText').style.display = 'flex';

            // Simulate OCR processing (in real app, use Tesseract.js or API)
            setTimeout(() => {
                const parsed = this.simulateReceiptOCR();
                document.getElementById('analyzingText').style.display = 'none';
                this.addTransaction({...parsed, receipt: this.currentReceiptData});
                this.showConfirmation(`Added: $${parsed.amount} at ${parsed.merchant}`);
            }, 2000);
        };
        reader.readAsDataURL(file);
    }

    simulateReceiptOCR() {
        // In a real app, this would use Tesseract.js or a cloud OCR API
        // For demo purposes, we'll generate random-ish data
        const merchants = ['Whole Foods', 'Target', 'Starbucks', 'Shell Gas', 'CVS Pharmacy', 'Amazon', 'Uber'];
        const amounts = [12.99, 45.67, 23.45, 8.99, 67.89, 34.56, 15.00];

        return {
            date: new Date().toISOString().split('T')[0],
            merchant: merchants[Math.floor(Math.random() * merchants.length)],
            amount: amounts[Math.floor(Math.random() * amounts.length)],
            paymentMethod: 'Credit Card',
            category: 'Shopping',
            notes: 'Auto-extracted from receipt'
        };
    }

    addTransactionFromForm() {
        const transaction = {
            date: document.getElementById('date').value,
            merchant: document.getElementById('merchant').value,
            amount: parseFloat(document.getElementById('amount').value),
            paymentMethod: document.getElementById('paymentMethod').value,
            category: this.categorizeTransaction(document.getElementById('merchant').value),
            notes: ''
        };

        this.addTransaction(transaction);
        this.showConfirmation(`Added: $${transaction.amount} at ${transaction.merchant}`);
        document.getElementById('transactionForm').reset();
        document.getElementById('date').valueAsDate = new Date();
    }

    addTransaction(data) {
        const transaction = {
            id: Date.now(),
            ...data,
            timestamp: new Date().toISOString()
        };

        this.transactions.unshift(transaction);
        this.saveTransactions();
        this.renderTransactions();
    }

    categorizeTransaction(merchant) {
        const merchantLower = merchant.toLowerCase();

        if (merchantLower.includes('starbucks') || merchantLower.includes('coffee') ||
            merchantLower.includes('restaurant') || merchantLower.includes('pizza')) {
            return 'Food & Dining';
        } else if (merchantLower.includes('whole foods') || merchantLower.includes('trader joe') ||
                   merchantLower.includes('safeway') || merchantLower.includes('grocery')) {
            return 'Groceries';
        } else if (merchantLower.includes('shell') || merchantLower.includes('chevron') ||
                   merchantLower.includes('uber') || merchantLower.includes('lyft')) {
            return 'Transportation';
        } else if (merchantLower.includes('amazon') || merchantLower.includes('target') ||
                   merchantLower.includes('walmart')) {
            return 'Shopping';
        }
        return 'Other';
    }

    showConfirmation(message) {
        const confirmMsg = document.getElementById('confirmationMsg');
        confirmMsg.textContent = message;
        confirmMsg.style.display = 'block';

        setTimeout(() => {
            confirmMsg.style.display = 'none';
            // Reset to initial state
            document.querySelectorAll('.quick-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById('voiceInterface').style.display = 'none';
            document.getElementById('cameraInterface').style.display = 'none';
            document.getElementById('manualInterface').style.display = 'none';
            document.getElementById('voiceTranscript').textContent = '';
            document.getElementById('cameraPreview').innerHTML = '';
        }, 3000);
    }

    deleteTransaction(id) {
        if (confirm('Delete this transaction?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveTransactions();
            this.renderTransactions();
        }
    }

    renderTransactions() {
        const filterPayment = document.getElementById('filterPayment').value;
        const filterCategory = document.getElementById('filterCategory').value;

        let filtered = this.transactions;

        if (filterPayment) {
            filtered = filtered.filter(t => t.paymentMethod === filterPayment);
        }

        if (filterCategory) {
            filtered = filtered.filter(t => t.category === filterCategory);
        }

        const listContainer = document.getElementById('transactionsList');

        if (filtered.length === 0) {
            listContainer.innerHTML = '<p class="empty-state">No transactions yet. Use Quick Add above!</p>';
        } else {
            listContainer.innerHTML = filtered.map(t => this.createTransactionHTML(t)).join('');
        }

        this.updateSummary(filtered);
    }

    createTransactionHTML(transaction) {
        const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const receiptHTML = transaction.receipt
            ? `<div class="transaction-receipt">
                <img src="${transaction.receipt}"
                     class="receipt-thumbnail"
                     alt="Receipt"
                     onclick="transactionManager.showReceipt('${transaction.receipt}')">
               </div>`
            : '';

        const notesHTML = transaction.notes
            ? `<div class="transaction-notes">${transaction.notes}</div>`
            : '';

        return `
            <div class="transaction-item">
                <div class="transaction-header">
                    <div class="transaction-merchant">${transaction.merchant}</div>
                    <div class="transaction-amount">$${transaction.amount.toFixed(2)}</div>
                </div>
                <div class="transaction-details">
                    <span class="transaction-badge">${transaction.paymentMethod}</span>
                    <span class="transaction-badge">${transaction.category}</span>
                    <span class="transaction-date">${formattedDate}</span>
                </div>
                ${notesHTML}
                ${receiptHTML}
                <div class="transaction-actions">
                    <button class="btn-delete" onclick="transactionManager.deleteTransaction(${transaction.id})">Delete</button>
                </div>
            </div>
        `;
    }

    updateSummary(transactions) {
        const totalCount = transactions.length;
        const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

        document.getElementById('totalCount').textContent = totalCount;
        document.getElementById('totalAmount').textContent = `$${totalAmount.toFixed(2)}`;
    }

    showReceipt(receiptData) {
        const modal = document.getElementById('receiptModal');
        const modalImg = document.getElementById('modalReceiptImage');
        modal.style.display = 'block';
        modalImg.src = receiptData;
    }

    closeModal() {
        document.getElementById('receiptModal').style.display = 'none';
    }

    saveTransactions() {
        try {
            localStorage.setItem('transactions', JSON.stringify(this.transactions));
        } catch (e) {
            console.error('Error saving:', e);
        }
    }

    loadTransactions() {
        try {
            const data = localStorage.getItem('transactions');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }
}

// Initialize
let transactionManager;
document.addEventListener('DOMContentLoaded', () => {
    transactionManager = new TransactionManager();
});
