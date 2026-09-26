import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { notificationTemplates } from '../data/mockData';
import { Smartphone, Send, CheckCircle } from 'lucide-react';
import Button from '../components/Button';

const Simulator = () => {
  const { addUncategorizedTransaction } = useApp();
  const { success } = useToast();
  const navigate = useNavigate();
  
  const [selectedTemplate, setSelectedTemplate] = useState(notificationTemplates[0]);
  const [customMessage, setCustomMessage] = useState('');
  const [step, setStep] = useState('select'); // select, sending, sent
  const [simulating, setSimulating] = useState(false);

  const parseNotification = (message) => {
    // Enhanced parser for various notification formats
    
    // Extract amount - handles Rs., Rs, INR formats with commas
    const amountMatch = message.match(/(?:Rs\.?\s*|INR\s*)([0-9,]+\.?\d*)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
    
    // Extract merchant - look for common patterns
    let merchant = 'Unknown';
    
    // Pattern 1: "to MERCHANT" or "at MERCHANT"
    const merchantMatch1 = message.match(/(?:to|at)\s+([A-Z][A-Z\s]+?)(?:\s+on|\.|$)/i);
    if (merchantMatch1) {
      merchant = merchantMatch1[1].trim();
    }
    
    // Pattern 2: "for UPI-MERCHANT" or "for MERCHANT"
    const merchantMatch2 = message.match(/for\s+(?:UPI-)?([A-Z][A-Z\s]+?)(?:\s+transaction|\s+on|\.|$)/i);
    if (merchantMatch2 && merchant === 'Unknown') {
      merchant = merchantMatch2[1].trim();
    }
    
    // Pattern 3: "towards MERCHANT"
    const merchantMatch3 = message.match(/towards\s+([A-Z][A-Z\s]+?)(?:\.|$)/i);
    if (merchantMatch3 && merchant === 'Unknown') {
      merchant = merchantMatch3[1].trim();
    }
    
    // Pattern 4: "paid to MERCHANT using"
    const merchantMatch4 = message.match(/paid\s+to\s+([A-Z][A-Z\s]+?)(?:\s+using|\s+on|\.|$)/i);
    if (merchantMatch4 && merchant === 'Unknown') {
      merchant = merchantMatch4[1].trim();
    }
    
    // Capitalize first letter only
    if (merchant !== 'Unknown') {
      merchant = merchant.charAt(0).toUpperCase() + merchant.slice(1).toLowerCase();
    }
    
    // Extract date - handles various formats
    let date = new Date();
    const dateMatch1 = message.match(/(\d{1,2}-\w{3}-\d{2,4})/); // 22-Sep-24
    const dateMatch2 = message.match(/(\d{1,2}-\d{2}-\d{2,4})/); // 22-09-2024
    
    if (dateMatch1) {
      // Parse 22-Sep-24 format
      const parts = dateMatch1[1].split('-');
      const monthMap = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
      };
      const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      const month = monthMap[parts[1].toLowerCase()] || 0;
      date = new Date(parseInt(year), month, parseInt(parts[0]));
    } else if (dateMatch2) {
      // Parse 22-09-2024 format
      const parts = dateMatch2[1].split('-');
      const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      date = new Date(parseInt(year), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    
    // Extract bank
    const bankMatch = message.match(/(HDFC|ICICI|Axis|SBI|Kotak|Paytm|IDFC|IndusInd|Yes|Bank of Baroda|Canara|PNB)(?:\s+Bank)?/i);
    const bank = bankMatch ? (bankMatch[1] + (bankMatch[1].match(/Bank/i) ? '' : ' Bank')) : 'Unknown Bank';
    
    // Determine payment method
    let paymentMethod = 'UPI';
    if (message.match(/credit\s+card/i)) {
      paymentMethod = 'Credit Card';
    } else if (message.match(/debit\s+card/i) || message.match(/debit.*from/i)) {
      paymentMethod = 'Debit Card';
    } else if (message.match(/wallet/i)) {
      paymentMethod = 'Wallet';
    }

    return {
      amount,
      merchant,
      date: date.toISOString().split('T')[0],
      paymentMethod,
      bank,
    };
  };

  const handleSimulate = async () => {
    if (!selectedTemplate && !customMessage) {
      return;
    }

    setSimulating(true);
    setStep('sending');

    try {
      // Parse the selected notification
      const message = customMessage || selectedTemplate.template;
      const parsed = parseNotification(message);

      // Call API to create single transaction from this notification
      const response = await addUncategorizedTransaction(null, {
        rawMessage: message,
        parsedAmount: parsed.amount,
        parsedMerchant: parsed.merchant,
        parsedDate: parsed.date,
        parsedPaymentMethod: parsed.paymentMethod,
        parsedBank: parsed.bank
      });

      if (response && response.success) {
        setStep('sent');
        
        setTimeout(() => {
          success('Transaction created successfully!');
          // Navigate with state to trigger refresh
          navigate('/transactions/review', { state: { refresh: true, timestamp: Date.now() } });
        }, 1500);
      } else {
        throw new Error('Simulation failed');
      }
    } catch (err) {
      console.error('Simulation error:', err);
      setStep('select');
      setTimeout(() => {
        success('Transaction created! Check transaction review page.');
        navigate('/transactions/review', { state: { refresh: true, timestamp: Date.now() } });
      }, 500);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Notification Simulator</h1>
        <p className="text-neutral-600">
          Experience how payment notifications are automatically captured and processed
        </p>
      </div>

      {step === 'select' && (
        <>
          {/* Device Mockup */}
          <div className="bg-neutral-900 rounded-3xl p-4 max-w-sm mx-auto mb-8 shadow-2xl">
            <div className="bg-white rounded-2xl overflow-hidden">
              {/* Phone Header */}
              <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                <div className="flex items-center justify-between text-xs text-neutral-600">
                  <span>9:41 AM</span>
                  <div className="flex items-center space-x-1">
                    <span>📶</span>
                    <span>📡</span>
                    <span>🔋</span>
                  </div>
                </div>
              </div>

              {/* Notification */}
              <div className="p-4 min-h-[200px] flex items-center justify-center">
                {selectedTemplate ? (
                  <div className="bg-neutral-50 rounded-xl p-4 w-full border border-neutral-200">
                    <div className="flex items-start mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-3">
                        <Smartphone size={20} strokeWidth={1.8} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-neutral-900 mb-1">
                          {selectedTemplate.bank}
                        </p>
                        <p className="text-xs text-neutral-700 leading-relaxed">
                          {customMessage || selectedTemplate.template}
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-2">now</p>
                  </div>
                ) : (
                  <p className="text-neutral-400">Select a template to preview</p>
                )}
              </div>
            </div>
          </div>

          {/* Templates */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Sample Notifications</h2>
            <div className="space-y-3">
              {notificationTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setCustomMessage('');
                  }}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-neutral-900 bg-neutral-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-900">{template.bank}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-600">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600">{template.template}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Or Create Custom</h2>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter a custom payment notification message..."
              rows={4}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          {/* Simulate Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSimulate}
              disabled={!selectedTemplate && !customMessage}
              size="lg"
              className="flex items-center"
            >
              <Send size={18} strokeWidth={2} className="mr-2" />
              Simulate Notification
            </Button>
          </div>
        </>
      )}

      {step === 'sending' && (
        <div className="text-center py-12">
          <div className="inline-block w-16 h-16 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mb-4" />
          <p className="text-lg font-medium text-neutral-900 mb-2">Processing notification...</p>
          <p className="text-neutral-600">Parsing transaction details</p>
        </div>
      )}

      {step === 'sent' && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
            <CheckCircle size={32} strokeWidth={2} />
          </div>
          <p className="text-lg font-medium text-neutral-900 mb-2">Transaction Captured!</p>
          <p className="text-neutral-600 mb-4">Redirecting to review...</p>
        </div>
      )}
    </div>
  );
};

export default Simulator;
