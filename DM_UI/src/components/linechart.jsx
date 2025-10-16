import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ResponsiveContainer,
} from "recharts";

export default function LineChart() {
  // 🔹 Simulated Prophet-style data: 12 months actual (2024) + 12 months forecast (2025)
  const data = [
    { month: "Jan", y2024: 100, y2025: 110, lower: 95, upper: 105 },
    { month: "Feb", y2024: 110, y2025: 115, lower: 100, upper: 115 },
    { month: "Mar", y2024: 120, y2025: 125, lower: 105, upper: 125 },
    { month: "Apr", y2024: 130, y2025: 135, lower: 110, upper: 135 },
    { month: "May", y2024: 140, y2025: 145, lower: 115, upper: 145 },
    { month: "Jun", y2024: 150, y2025: 155, lower: 120, upper: 155 },
    { month: "Jul", y2024: 160, y2025: 165, lower: 125, upper: 165 },
    { month: "Aug", y2024: 170, y2025: 175, lower: 130, upper: 175 },
    { month: "Sep", y2024: 180, y2025: 185, lower: 135, upper: 185 },
    { month: "Oct", y2024: 190, y2025: 195, lower: 140, upper: 195 },
    { month: "Nov", y2024: 200, y2025: 205, lower: 145, upper: 205 },
    { month: "Dec", y2024: 210, y2025: 215, lower: 150, upper: 215 },
  ];

  return (
    <div className="flex items-center justify-center h-full w-full rounded-2xl bg-gray-500 p-4 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={data}>
          <CartesianGrid stroke="#9ca3af" strokeDasharray="3 3" />
          <XAxis dataKey="month" stroke="#f9fafb" />
          <YAxis stroke="#f9fafb" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#374151",
              border: "1px solid #9ca3af",
              borderRadius: "8px",
              color: "#f9fafb",
            }}
          />
          <Legend wrapperStyle={{ color: "#f9fafb" }} />

          {/* Confidence interval */}
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="rgba(250, 204, 21, 0.2)"
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="rgba(250, 204, 21, 0.2)"
          />

          {/* Actual 2024 */}
          <Line
            type="monotone"
            dataKey="y2024"
            name="Actual 2024"
            stroke="#3b82f6"
            dot={false}
            strokeWidth={3}
          />

          {/* Forecast 2025 */}
          <Line
            type="monotone"
            dataKey="y2025"
            name="Forecast 2025"
            stroke="#facc15"
            dot={false}
            strokeWidth={3}
            strokeDasharray="5 5"
          />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}
