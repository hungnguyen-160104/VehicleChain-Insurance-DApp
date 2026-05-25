import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  FiShield,
  FiPieChart,
  FiBarChart,
  FiCreditCard,
  FiTrendingUp,
  FiDollarSign,
  FiTarget,
  FiActivity,
} from "react-icons/fi";

const PolicyAnalytics = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="relative bg-white shadow-sm border border-gray-100 rounded-2xl p-8">
        <div className="relative">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
              <FiShield className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Policy Analytics
            </h3>
          </div>

          <div className="animate-pulse space-y-6">
            <div className="h-80 bg-gray-100 rounded-2xl"></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-40 bg-gray-100 rounded-2xl"></div>
              <div className="h-40 bg-gray-100 rounded-2xl"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-gray-100 rounded-xl"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const planData = Object.entries(data.insuranceTypeDistribution || {}).map(
    ([plan, count]) => ({
      name: plan,
      value: count,
    })
  );

  const paymentData = Object.entries(data.paymentTypeDistribution || {}).map(
    ([type, count]) => ({
      name: type,
      value: count,
    })
  );

  const coverageData = (data.coverageDistribution || []).map((item) => ({
    policy: `Policy ${item.policyId}`,
    total: item.coverage,
    used: item.used,
    remaining: item.remaining,
  }));

  const COLORS = [
    "#6366f1",
    "#8b5cf6",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 shadow-lg rounded-xl p-4">
          <p className="font-bold text-gray-900 mb-2">{label}</p>
          {payload.map((pld, index) => (
            <p
              key={index}
              style={{ color: pld.color }}
              className="text-sm font-medium"
            >
              {`${pld.dataKey}: ${pld.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative bg-white shadow-sm border border-gray-100 rounded-2xl p-8">
      <div className="relative">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
            <FiShield className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Policy Analytics
            </h3>
            <p className="text-gray-500">
              Comprehensive insights into your policy portfolio
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Plan Distribution */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <FiPieChart className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">
                Phân bố loại bảo hiểm
              </h4>
            </div>

            {planData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {planData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <FiPieChart className="h-10 w-10 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    No policy data available
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Type Distribution */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                <FiCreditCard className="h-5 w-5 text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Payment Types</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(data.paymentTypeDistribution || {}).map(
                ([type, count], index) => (
                  <div
                    key={type}
                    className="relative bg-white border border-gray-100 shadow-sm rounded-2xl p-6 group hover:shadow-md transition-all duration-300 transform hover:scale-105"
                  >
                    <div
                      className="absolute inset-0 rounded-2xl opacity-5"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div className="relative text-center">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${
                            COLORS[index % COLORS.length]
                          }20, ${COLORS[index % COLORS.length]}10)`,
                          border: `1px solid ${
                            COLORS[index % COLORS.length]
                          }30`,
                        }}
                      >
                        <FiCreditCard
                          className="h-6 w-6"
                          style={{ color: COLORS[index % COLORS.length] }}
                        />
                      </div>
                      <div
                        className="text-3xl font-bold mb-2"
                        style={{ color: COLORS[index % COLORS.length] }}
                      >
                        {count}
                      </div>
                      <div className="text-sm font-semibold text-gray-500 capitalize">
                        {type}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Coverage Utilization */}
          {coverageData.length > 0 && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                  <FiBarChart className="h-5 w-5 text-orange-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">
                  Coverage Utilization
                </h4>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={coverageData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="policy"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      tickLine={{ stroke: "#d1d5db" }}
                    />
                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      tickLine={{ stroke: "#d1d5db" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="used"
                      stackId="a"
                      fill="url(#usedGradient)"
                      name="Used"
                      radius={[0, 0, 4, 4]}
                    />
                    <Bar
                      dataKey="remaining"
                      stackId="a"
                      fill="url(#remainingGradient)"
                      name="Remaining"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient
                        id="usedGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                      <linearGradient
                        id="remainingGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6 group hover:shadow-md transition-all duration-300">
              <div className="relative flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiTarget className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {(data.totalCoverage || 0).toFixed(2)} ETH
                  </div>
                  <div className="text-sm font-medium text-red-600">
                    Total Coverage
                  </div>
                  <div className="text-xs text-red-500 mt-1">
                    Available protection amount
                  </div>
                </div>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 group hover:shadow-md transition-all duration-300">
              <div className="relative flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiTrendingUp className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {(data.totalUsedCoverage || 0).toFixed(2)} ETH
                  </div>
                  <div className="text-sm font-medium text-red-600">
                    Coverage Used
                  </div>
                  <div className="text-xs text-red-500 mt-1">
                    Amount claimed so far
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coverage Utilization Rate */}
          {data.totalCoverage > 0 && (
            <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-100 rounded-full blur-xl"></div>

              <div className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                  <FiActivity className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-4xl font-bold text-purple-700 mb-2">
                  {(
                    ((data.totalUsedCoverage || 0) /
                      (data.totalCoverage || 1)) *
                    100
                  ).toFixed(1)}
                  %
                </div>
                <div className="text-lg font-semibold text-purple-600">
                  Coverage Utilization Rate
                </div>
                <p className="text-purple-500 mt-2">
                  Percentage of total coverage that has been claimed
                </p>

                {/* Progress Bar */}
                <div className="mt-6 bg-purple-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min(
                        ((data.totalUsedCoverage || 0) /
                          (data.totalCoverage || 1)) *
                          100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyAnalytics;
