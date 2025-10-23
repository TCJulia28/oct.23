# Transaction Tracker

A beautiful, intuitive web application for tracking your daily transactions with voice input, receipt scanning, and automatic categorization.

## Features

### Three Easy Ways to Add Transactions

- **Voice Input**: Simply say your transaction (e.g., "Spent $25 at Starbucks with Apple Pay")
- **Receipt Scanner**: Take a photo of your receipt for automatic data extraction
- **Manual Entry**: Quick 4-field form for traditional input

### Smart Features

- Automatic transaction categorization based on merchant
- Voice recognition powered by Web Speech API
- Receipt photo storage and viewing
- Real-time filtering by payment method and category
- Transaction summary with totals
- Local storage - your data stays private on your device

### Supported Payment Methods

- Apple Pay
- Zelle
- Venmo
- Cash App
- PayPal
- Credit Card
- Debit Card
- Cash

### Auto-Categorization

Transactions are automatically categorized into:
- Food & Dining
- Groceries
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Personal
- Other

## Design

Beautiful cream and light yellow color scheme for a warm, inviting user experience.

## How to Use

1. Open `index.html` in your web browser
2. Choose your preferred input method:
   - Click **Voice** to speak your transaction
   - Click **Receipt** to snap a photo
   - Click **Manual** for quick typing
3. View and manage all your transactions in the list below

### Voice Input Examples

- "Spent $25 at Starbucks with Apple Pay"
- "Paid $50 to Whole Foods using Zelle"
- "$15 at Shell with credit card"

## Browser Compatibility

- **Voice Input**: Works best in Chrome and Safari (requires Web Speech API)
- **Receipt Scanner**: Works in all modern browsers
- **Manual Entry**: Works in all browsers

## Technology Stack

- Pure HTML5, CSS3, and JavaScript
- No external dependencies
- Uses browser's localStorage for data persistence
- Web Speech API for voice recognition
- FileReader API for image handling

## Installation

No installation required! Simply:

1. Download or clone this repository
2. Open `index.html` in your web browser
3. Start tracking your transactions

## Data Privacy

All your transaction data is stored locally in your browser's localStorage. Nothing is sent to any server - your financial information stays completely private on your device.

## Files

- `index.html` - Main application structure
- `styles.css` - Beautiful cream/yellow styling
- `script.js` - All application logic and functionality

## Future Enhancements

- Real OCR integration (Tesseract.js or cloud OCR API)
- Export to CSV/Excel
- Monthly/yearly reports and charts
- Budget tracking and alerts
- Multi-currency support
- Data backup and sync

## License

Free to use and modify for personal or commercial projects.

## Credits

Built with love for easy transaction tracking.
