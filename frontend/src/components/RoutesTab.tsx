import { useState, useEffect } from 'react';
import { routesAPI, Route } from '../api';

export default function RoutesTab() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    vesselType: '',
    fuelType: '',
    year: '',
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const filterParams: any = {};
      if (filters.vesselType) filterParams.vesselType = filters.vesselType;
      if (filters.fuelType) filterParams.fuelType = filters.fuelType;
      if (filters.year) filterParams.year = parseInt(filters.year);

      const response = await routesAPI.getAll(filterParams);
      if (response.success) {
        setRoutes(response.data);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetBaseline = async (id: string) => {
    try {
      const response = await routesAPI.setBaseline(id);
      if (response.success) {
        await fetchRoutes();
      }
    } catch (error) {
      console.error('Error setting baseline:', error);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    fetchRoutes();
  };

  const handleClearFilters = () => {
    setFilters({ vesselType: '', fuelType: '', year: '' });
    setTimeout(fetchRoutes, 0);
  };

  if (loading) {
    return <div className="text-center py-8">Loading routes...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Route Management</h2>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vessel Type
          </label>
          <select
            className="input-field"
            value={filters.vesselType}
            onChange={(e) => handleFilterChange('vesselType', e.target.value)}
          >
            <option value="">All</option>
            <option value="Container">Container</option>
            <option value="BulkCarrier">Bulk Carrier</option>
            <option value="Tanker">Tanker</option>
            <option value="RoRo">RoRo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fuel Type
          </label>
          <select
            className="input-field"
            value={filters.fuelType}
            onChange={(e) => handleFilterChange('fuelType', e.target.value)}
          >
            <option value="">All</option>
            <option value="HFO">HFO</option>
            <option value="LNG">LNG</option>
            <option value="MGO">MGO</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year
          </label>
          <input
            type="number"
            className="input-field"
            placeholder="e.g., 2024"
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
          />
        </div>

        <div className="flex items-end space-x-2">
          <button onClick={handleApplyFilters} className="btn-primary">
            Apply
          </button>
          <button onClick={handleClearFilters} className="btn-secondary">
            Clear
          </button>
        </div>
      </div>

      {/* Routes Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Route ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vessel Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fuel Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                GHG Intensity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fuel (tonnes)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Distance (km)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Baseline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {routes.map((route) => (
              <tr key={route.id}>
                <td className="table-cell font-medium text-gray-900">
                  {route.routeId}
                </td>
                <td className="table-cell text-gray-500">{route.vesselType}</td>
                <td className="table-cell text-gray-500">{route.fuelType}</td>
                <td className="table-cell text-gray-500">{route.year}</td>
                <td className="table-cell text-gray-500">
                  {route.ghgIntensity.toFixed(2)}
                </td>
                <td className="table-cell text-gray-500">
                  {route.fuelConsumption.toLocaleString()}
                </td>
                <td className="table-cell text-gray-500">
                  {route.distance.toLocaleString()}
                </td>
                <td className="table-cell">
                  {route.isBaseline ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Baseline
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="table-cell">
                  {!route.isBaseline && (
                    <button
                      onClick={() => handleSetBaseline(route.id)}
                      className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                    >
                      Set Baseline
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {routes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No routes found. Try adjusting your filters.
          </div>
        )}
      </div>
    </div>
  );
}
