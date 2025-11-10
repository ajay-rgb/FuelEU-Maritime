import { useState, useEffect } from 'react';
import { routesAPI } from '../api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface Comparison {
  route: any;
  baseline: any;
  percentDiff: number;
  isCompliant: boolean;
  target: number;
}

export default function CompareTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparison();
  }, []);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const response = await routesAPI.getComparison();
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading comparison data...</div>;
  }

  if (!data || !data.baseline) {
    return (
      <div className="text-center py-8 text-gray-500">
        No baseline route set. Please set a baseline in the Routes tab first.
      </div>
    );
  }

  const chartData = [
    {
      name: `${data.baseline.routeId} (Baseline)`,
      ghgIntensity: data.baseline.ghgIntensity,
      fill: '#10b981',
    },
    ...data.comparisons.map((comp: Comparison) => ({
      name: comp.route.routeId,
      ghgIntensity: comp.route.ghgIntensity,
      fill: comp.isCompliant ? '#3b82f6' : '#ef4444',
    })),
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Route Comparison</h2>

      {/* Target Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Target GHG Intensity (2025):</strong> {data.target.toFixed(5)} gCO2eq/MJ
          <br />
          <span className="text-xs">
            (2% below baseline of 91.16 gCO2eq/MJ)
          </span>
        </p>
      </div>

      {/* Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">GHG Intensity Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'gCO2eq/MJ', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <ReferenceLine
              y={data.target}
              label="Target"
              stroke="red"
              strokeDasharray="3 3"
            />
            <Bar dataKey="ghgIntensity" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Route ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Vessel Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fuel Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                GHG Intensity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                % Diff from Baseline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Compliance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Baseline Row */}
            <tr className="bg-green-50">
              <td className="table-cell font-medium text-gray-900">
                {data.baseline.routeId} (Baseline)
              </td>
              <td className="table-cell">{data.baseline.vesselType}</td>
              <td className="table-cell">{data.baseline.fuelType}</td>
              <td className="table-cell">{data.baseline.ghgIntensity.toFixed(2)}</td>
              <td className="table-cell">-</td>
              <td className="table-cell">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Baseline
                </span>
              </td>
            </tr>

            {/* Comparison Rows */}
            {data.comparisons.map((comp: Comparison) => (
              <tr key={comp.route.id}>
                <td className="table-cell font-medium text-gray-900">
                  {comp.route.routeId}
                </td>
                <td className="table-cell">{comp.route.vesselType}</td>
                <td className="table-cell">{comp.route.fuelType}</td>
                <td className="table-cell">{comp.route.ghgIntensity.toFixed(2)}</td>
                <td className="table-cell">
                  <span
                    className={
                      comp.percentDiff > 0 ? 'text-red-600' : 'text-green-600'
                    }
                  >
                    {comp.percentDiff > 0 ? '+' : ''}
                    {comp.percentDiff.toFixed(2)}%
                  </span>
                </td>
                <td className="table-cell">
                  {comp.isCompliant ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      ✓ Compliant
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      ✗ Non-Compliant
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
