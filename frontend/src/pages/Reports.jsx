import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import Button from '../components/Button';
import Select from '../components/Select';
import api, { downloadFile } from '../services/api';

const Reports = () => {
  const { expenses, categories } = useApp();
  const { success, error: showError } = useToast();
  
  const [reportType, setReportType] = useState('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentPeriod('monthly'));
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [generatedReportId, setGeneratedReportId] = useState(null);

  function getCurrentPeriod(type) {
    const now = new Date();
    if (type === 'monthly') {
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    } else if (type === 'quarterly') {
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      return `${now.getFullYear()}-Q${quarter}`;
    } else {
      return String(now.getFullYear());
    }
  }

  const periodOptions = useMemo(() => {
    const options = [];
    const now = new Date();

    if (reportType === 'monthly') {
      for (let i = 0; i < 60; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        options.push({ value, label });
      }
    } else if (reportType === 'quarterly') {
      for (let i = 0; i < 20; i++) {
        const year = now.getFullYear() - Math.floor(i / 4);
        const quarter = 4 - (i % 4);
        options.push({ value: `${year}-Q${quarter}`, label: `Q${quarter} ${year}` });
      }
    } else if (reportType === 'yearly') {
      for (let i = 0; i < 5; i++) {
        const year = now.getFullYear() - i;
        options.push({ value: String(year), label: String(year) });
      }
    }

    return options;
  }, [reportType]);

  const reportData = useMemo(() => {
    let filtered = [...expenses];

    // Filter by period
    if (reportType === 'monthly') {
      const [year, month] = selectedPeriod.split('-');
      filtered = filtered.filter(exp => {
        const date = new Date(exp.date);
        return date.getFullYear() === parseInt(year) && date.getMonth() + 1 === parseInt(month);
      });
    } else if (reportType === 'quarterly') {
      const [year, q] = selectedPeriod.split('-Q');
      const quarter = parseInt(q);
      filtered = filtered.filter(exp => {
        const date = new Date(exp.date);
        const expQuarter = Math.floor(date.getMonth() / 3) + 1;
        return date.getFullYear() === parseInt(year) && expQuarter === quarter;
      });
    } else {
      filtered = filtered.filter(exp => {
        const date = new Date(exp.date);
        return date.getFullYear() === parseInt(selectedPeriod);
      });
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(exp => exp.categoryId === selectedCategory);
    }

    return filtered;
  }, [expenses, reportType, selectedPeriod, selectedCategory]);

  const summary = useMemo(() => {
    const total = reportData.reduce((sum, exp) => sum + exp.amount, 0);
    const count = reportData.length;
    const average = count > 0 ? total / count : 0;

    const byCategory = categories.map(cat => {
      const catExpenses = reportData.filter(exp => exp.categoryId === cat.id);
      const catTotal = catExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      return {
        ...cat,
        total: catTotal,
        count: catExpenses.length,
        percentage: total > 0 ? (catTotal / total) * 100 : 0,
      };
    }).filter(cat => cat.total > 0)
      .sort((a, b) => b.total - a.total);

    return { total, count, average, byCategory };
  }, [reportData, categories]);

  const handleExport = async (format) => {
    try {
      setLoading(true);
      
      // First generate report if not already generated
      let reportId = generatedReportId;
      
      if (!reportId) {
        // Get date range from selected period
        const { startDate, endDate } = getDateRangeFromPeriod();
        
        const reportData = {
          report_type: 'summary',
          report_period: reportType,
          start_date: startDate,
          end_date: endDate,
        };
        
        const response = await api.report.generateReport(reportData);
        
        if (response.success) {
          reportId = response.data.report_id;
          setGeneratedReportId(reportId);
        } else {
          showError('Failed to generate report');
          return;
        }
      }
      
      // Now export in requested format
      let blob;
      let filename;
      
      if (format === 'PDF') {
        blob = await api.report.exportPDF(reportId);
        filename = `expense-report-${selectedPeriod}.pdf`;
      } else if (format === 'CSV') {
        blob = await api.report.exportCSV(reportId);
        filename = `expense-report-${selectedPeriod}.csv`;
      } else if (format === 'Excel') {
        blob = await api.report.exportExcel(reportId);
        filename = `expense-report-${selectedPeriod}.xlsx`;
      }
      
      // Download the file
      downloadFile(blob, filename);
      success(`${format} report downloaded successfully!`);
      
    } catch (err) {
      console.error('Export error:', err);
      showError(`Failed to export ${format} report. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to get date range from period
  const getDateRangeFromPeriod = () => {
    let startDate, endDate;
    
    if (reportType === 'monthly') {
      const [year, month] = selectedPeriod.split('-');
      startDate = `${year}-${month}-01`;
      // Last day of month
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      endDate = `${year}-${month}-${lastDay}`;
    } else if (reportType === 'quarterly') {
      const [year, q] = selectedPeriod.split('-Q');
      const quarter = parseInt(q);
      const startMonth = (quarter - 1) * 3 + 1;
      const endMonth = quarter * 3;
      startDate = `${year}-${String(startMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(parseInt(year), endMonth, 0).getDate();
      endDate = `${year}-${String(endMonth).padStart(2, '0')}-${lastDay}`;
    } else {
      // Yearly
      startDate = `${selectedPeriod}-01-01`;
      endDate = `${selectedPeriod}-12-31`;
    }
    
    return { startDate, endDate };
  };
  
  // Reset generated report when period changes
  useEffect(() => {
    setGeneratedReportId(null);
  }, [selectedPeriod, reportType, selectedCategory]);

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(cat => ({ value: cat.id, label: cat.name })),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Reports</h1>
        <p className="text-neutral-600">Generate and export expense reports</p>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Report Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Report Type"
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value);
              setSelectedPeriod(getCurrentPeriod(e.target.value));
            }}
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
          />
          <Select
            label="Period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            options={periodOptions}
          />
          <Select
            label="Category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={categoryOptions}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600 mb-1">Total Expenses</p>
          <p className="text-3xl font-semibold text-neutral-900">₹{summary.total.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600 mb-1">Transactions</p>
          <p className="text-3xl font-semibold text-neutral-900">{summary.count}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm text-neutral-600 mb-1">Average</p>
          <p className="text-3xl font-semibold text-neutral-900">₹{Math.round(summary.average).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Category Breakdown</h2>
        {summary.byCategory.length > 0 ? (
          <div className="space-y-4">
            {summary.byCategory.map(cat => (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">{cat.icon}</span>
                    <span className="text-sm font-medium text-neutral-900">{cat.name}</span>
                    <span className="ml-2 text-xs text-neutral-500">({cat.count} transactions)</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-900">₹{cat.total.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-neutral-500">{cat.percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-neutral-500 py-8">No expenses for this period</p>
        )}
      </div>

      {/* Expense Details */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Expense Details</h2>
        {reportData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Merchant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {reportData.map(expense => {
                  const category = categories.find(c => c.id === expense.categoryId);
                  return (
                    <tr key={expense.id}>
                      <td className="px-4 py-3 text-sm text-neutral-700">
                        {new Date(expense.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-900">{expense.merchant}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
                          style={{ backgroundColor: category?.color + '20', color: category?.color }}
                        >
                          {expense.categoryName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-neutral-900 text-right">
                        ₹{expense.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-neutral-500 py-8">No expenses to display</p>
        )}
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Export Report</h2>
        <p className="text-sm text-neutral-600 mb-4">Download this report in your preferred format</p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => handleExport('PDF')} disabled={loading || reportData.length === 0}>
            {loading ? 'Generating...' : 'Export as PDF'}
          </Button>
          <Button variant="secondary" onClick={() => handleExport('CSV')} disabled={loading || reportData.length === 0}>
            {loading ? 'Generating...' : 'Export as CSV'}
          </Button>
          <Button variant="secondary" onClick={() => handleExport('Excel')} disabled={loading || reportData.length === 0}>
            {loading ? 'Generating...' : 'Export as Excel'}
          </Button>
        </div>
        {reportData.length === 0 && (
          <p className="text-sm text-neutral-500 mt-3">Add expenses for this period to generate reports</p>
        )}
      </div>
    </div>
  );
};

export default Reports;
