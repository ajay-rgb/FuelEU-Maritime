import { useState, useEffect } from 'react';
import { complianceAPI, bankingAPI, ComplianceBalance, BankBalance } from '../api';

export default function BankingTab() {
  const [shipId, setShipId] = useState('SHIP001');
  const [year, setYear] = useState(2024);
  const [compliance, setCompliance] = useState<ComplianceBalance | null>(null);
  const [bankBalance, setBankBalance] = useState<BankBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [bankAmount, setBankAmount] = useState('');
  const [applyAmount, setApplyAmount] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [shipId, year]);

  const fetchData = async () => {
    setLoading(true);
    setMessage('');
    try {
      const [compResponse, bankResponse] = await Promise.all([
        complianceAPI.getComplianceBalance(shipId, year),
        bankingAPI.getRecords(shipId),
      ]);

      if (compResponse.success) {
        setCompliance(compResponse.data);
      }
      if (bankResponse.success) {
        setBankBalance(bankResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleBankSurplus = async () => {
    if (!bankAmount || parseFloat(bankAmount) <= 0) {
      setMessage('Please enter a valid amount to bank');
      return;
    }

    try {
      const response = await bankingAPI.bankSurplus(
        shipId,
        year,
        parseFloat(bankAmount)
      );

      if (response.success) {
        setMessage(`✓ ${response.message}`);
        setBankAmount('');
        await fetchData();
      } else {
        setMessage(`✗ ${response.message}`);
      }
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
    }
  };

  const handleApplyBanked = async () => {
    if (!applyAmount || parseFloat(applyAmount) <= 0) {
      setMessage('Please enter a valid amount to apply');
      return;
    }

    try {
      const response = await bankingAPI.applyBanked(
        shipId,
        year,
        parseFloat(applyAmount)
      );

      if (response.success) {
        setMessage(`✓ ${response.message}`);
        setApplyAmount('');
        await fetchData();
      } else {
        setMessage(`✗ ${response.message}`);
      }
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading banking data...</div>;
  }

  const hasSurplus = compliance && compliance.cbGco2eq > 0;
  const totalBanked = bankBalance?.totalBanked || 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Banking & Borrowing</h2>

      {/* Ship Selection */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ship ID
          </label>
          <select
            className="input-field"
            value={shipId}
            onChange={(e) => setShipId(e.target.value)}
          >
            <option value="SHIP001">SHIP001</option>
            <option value="SHIP002">SHIP002</option>
            <option value="SHIP003">SHIP003</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year
          </label>
          <input
            type="number"
            className="input-field"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.startsWith('✓')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* Current Compliance Balance */}
      {compliance && (
        <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            Current Compliance Balance ({year})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Compliance Balance</p>
              <p
                className={`text-2xl font-bold ${
                  compliance.cbGco2eq >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {compliance.cbGco2eq.toLocaleString()} gCO2eq
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {compliance.isCompliant ? '✓ Compliant' : '✗ Deficit'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Banked</p>
              <p className="text-2xl font-bold text-blue-600">
                {totalBanked.toLocaleString()} gCO2eq
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">GHG Intensity (Actual/Target)</p>
              <p className="text-lg font-medium text-gray-900">
                {compliance.ghgieActual.toFixed(5)} / {compliance.ghgieTarget.toFixed(5)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Banking Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bank Surplus */}
        <div className="p-6 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Bank Surplus</h3>
          <p className="text-sm text-gray-600 mb-4">
            Bank positive compliance balance for future use. No expiration.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Bank (gCO2eq)
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="0"
                value={bankAmount}
                onChange={(e) => setBankAmount(e.target.value)}
                disabled={!hasSurplus}
              />
            </div>
            <button
              onClick={handleBankSurplus}
              disabled={!hasSurplus || !bankAmount}
              className="btn-primary w-full"
            >
              Bank Surplus
            </button>
            {!hasSurplus && (
              <p className="text-sm text-amber-600">
                ⚠ No surplus available to bank
              </p>
            )}
          </div>
        </div>

        {/* Apply Banked */}
        <div className="p-6 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Apply Banked Surplus</h3>
          <p className="text-sm text-gray-600 mb-4">
            Apply banked surplus to current deficit. Available: {totalBanked.toLocaleString()} gCO2eq
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Apply (gCO2eq)
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="0"
                value={applyAmount}
                onChange={(e) => setApplyAmount(e.target.value)}
                disabled={totalBanked === 0}
              />
            </div>
            <button
              onClick={handleApplyBanked}
              disabled={totalBanked === 0 || !applyAmount}
              className="btn-primary w-full"
            >
              Apply Banked
            </button>
            {totalBanked === 0 && (
              <p className="text-sm text-amber-600">
                ⚠ No banked surplus available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bank Entries History */}
      {bankBalance && bankBalance.entries.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Banking History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount (gCO2eq)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bankBalance.entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="table-cell">{entry.year}</td>
                    <td className="table-cell">
                      {entry.amountGco2eq.toLocaleString()}
                    </td>
                    <td className="table-cell">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
