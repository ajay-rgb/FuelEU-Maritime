import { useState, useEffect } from 'react';
import { complianceAPI, poolingAPI, PoolMember, PoolResult } from '../api';

interface ShipWithCB {
  shipId: string;
  year: number;
  cbBefore: number;
  selected: boolean;
}

export default function PoolingTab() {
  const [year, setYear] = useState(2024);
  const [ships, setShips] = useState<ShipWithCB[]>([]);
  const [loading, setLoading] = useState(false);
  const [poolResult, setPoolResult] = useState<PoolResult | null>(null);
  const [message, setMessage] = useState('');

  const availableShips = ['SHIP001', 'SHIP002', 'SHIP003'];

  useEffect(() => {
    fetchShipData();
  }, [year]);

  const fetchShipData = async () => {
    setLoading(true);
    setMessage('');
    setPoolResult(null);
    try {
      const responses = await Promise.all(
        availableShips.map((shipId) =>
          complianceAPI.getAdjustedCB(shipId, year)
        )
      );

      const shipsData: ShipWithCB[] = responses.map((response, index) => ({
        shipId: availableShips[index],
        year,
        cbBefore: response.success ? response.data.adjustedCB : 0,
        selected: false,
      }));

      setShips(shipsData);
    } catch (error) {
      console.error('Error fetching ship data:', error);
      setMessage('Error loading ship data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShip = (shipId: string) => {
    setShips((prev) =>
      prev.map((ship) =>
        ship.shipId === shipId ? { ...ship, selected: !ship.selected } : ship
      )
    );
  };

  const handleCreatePool = async () => {
    const selectedShips = ships.filter((s) => s.selected);

    if (selectedShips.length < 2) {
      setMessage('✗ Please select at least 2 ships to create a pool');
      return;
    }

    const members: PoolMember[] = selectedShips.map((s) => ({
      shipId: s.shipId,
      cbBefore: s.cbBefore,
    }));

    try {
      const response = await poolingAPI.createPool(year, members);

      if (response.success && response.data.isValid) {
        setPoolResult(response.data);
        setMessage('✓ Pool created successfully!');
      } else {
        setMessage(`✗ ${response.data?.message || response.message || 'Pool validation failed'}`);
        setPoolResult(null);
      }
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
    }
  };

  const selectedShips = ships.filter((s) => s.selected);
  const totalCB = selectedShips.reduce((sum, s) => sum + s.cbBefore, 0);
  const canCreatePool = selectedShips.length >= 2 && totalCB >= 0;

  if (loading) {
    return <div className="text-center py-8">Loading pooling data...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Pooling</h2>

      {/* Year Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Year
        </label>
        <input
          type="number"
          className="input-field max-w-xs"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
        />
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

      {/* Pool Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Pooling Rules</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Total CB of pool members must be ≥ 0</li>
          <li>Deficit ships cannot exit worse than they entered</li>
          <li>Surplus ships cannot exit negative</li>
          <li>Greedy allocation: surplus transferred to deficit ships</li>
        </ul>
      </div>

      {/* Ship Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Select Ships for Pool</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Select
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ship ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  CB Before (gCO2eq)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ships.map((ship) => (
                <tr
                  key={ship.shipId}
                  className={ship.selected ? 'bg-blue-50' : ''}
                >
                  <td className="table-cell">
                    <input
                      type="checkbox"
                      checked={ship.selected}
                      onChange={() => handleToggleShip(ship.shipId)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="table-cell font-medium text-gray-900">
                    {ship.shipId}
                  </td>
                  <td className="table-cell">
                    <span
                      className={
                        ship.cbBefore >= 0 ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {ship.cbBefore.toLocaleString()}
                    </span>
                  </td>
                  <td className="table-cell">
                    {ship.cbBefore >= 0 ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Surplus
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Deficit
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pool Summary */}
      {selectedShips.length > 0 && (
        <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Pool Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Selected Ships</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedShips.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total CB Before</p>
              <p
                className={`text-2xl font-bold ${
                  totalCB >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {totalCB.toLocaleString()} gCO2eq
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pool Validity</p>
              <p className="text-2xl font-bold">
                {canCreatePool ? (
                  <span className="text-green-600">✓ Valid</span>
                ) : (
                  <span className="text-red-600">✗ Invalid</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleCreatePool}
            disabled={!canCreatePool}
            className="btn-primary mt-4"
          >
            Create Pool
          </button>
        </div>
      )}

      {/* Pool Result */}
      {poolResult && poolResult.isValid && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Pool Result</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ship ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    CB Before
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    CB After
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {poolResult.members.map((member) => {
                  const change = (member.cbAfter || 0) - member.cbBefore;
                  return (
                    <tr key={member.shipId}>
                      <td className="table-cell font-medium text-gray-900">
                        {member.shipId}
                      </td>
                      <td className="table-cell">
                        <span
                          className={
                            member.cbBefore >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {member.cbBefore.toLocaleString()}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span
                          className={
                            (member.cbAfter || 0) >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {(member.cbAfter || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span
                          className={
                            change > 0
                              ? 'text-green-600'
                              : change < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }
                        >
                          {change > 0 ? '+' : ''}
                          {change.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Pool ID:</strong> {poolResult.poolId}
              <br />
              <strong>Total CB After:</strong> {poolResult.totalCbAfter.toLocaleString()} gCO2eq
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
