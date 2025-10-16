import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ClusterScatterPlot() {
  // 🔹 Dummy customer data (simulate 10 clusters)
  const customerData = [
    { name: "Alice", amount: 100, qty: 5, cluster: 0 },
    { name: "Bob", amount: 200, qty: 10, cluster: 1 },
    { name: "Charlie", amount: 150, qty: 7, cluster: 0 },
    { name: "David", amount: 300, qty: 15, cluster: 1 },
    { name: "Eve", amount: 250, qty: 12, cluster: 2 },
    { name: "Frank", amount: 80, qty: 4, cluster: 2 },
    { name: "Grace", amount: 400, qty: 20, cluster: 3 },
    { name: "Heidi", amount: 500, qty: 25, cluster: 4 },
    { name: "Ivan", amount: 350, qty: 18, cluster: 5 },
    { name: "Judy", amount: 450, qty: 22, cluster: 6 },
    { name: "Ken", amount: 600, qty: 30, cluster: 7 },
    { name: "Leo", amount: 550, qty: 28, cluster: 8 },
    { name: "Mia", amount: 700, qty: 35, cluster: 9 },
  ];

  const best_k = 10;

  // 🌈 Brighter, high-contrast colors for dark backgrounds
  const COLORS = [
    "#FFB703", // bright yellow-orange
    "#8ECAE6", // light sky blue
    "#FB8500", // vivid orange
    "#90EE90", // light green
    "#FF69B4", // hot pink
    "#FFD700", // gold
    "#ADFF2F", // green-yellow
    "#40E0D0", // turquoise
    "#FF7F50", // coral
    "#E0FFFF"  // light cyan
  ];

  return (
    <div className="h-[500px] w-full bg-gray-500 p-4 rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
          <XAxis
            dataKey="amount"
            name="Total Sales"
            tick={{ fill: "#ffffff" }}
            label={{ value: "Total Sales", position: "insideBottom", fill: "#ffffff", dy: 10 }}
          />
          <YAxis
            dataKey="qty"
            name="Total Quantity"
            tick={{ fill: "#ffffff" }}
            label={{ value: "Total Quantity", angle: -90, position: "insideLeft", fill: "#ffffff" }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#fff" }}
          />
          <Legend wrapperStyle={{ color: "#ffffff" }} />
          {[...Array(best_k).keys()].map((clusterIdx) => (
            <Scatter
              key={clusterIdx}
              name={`Cluster ${clusterIdx}`}
              data={customerData.filter((c) => c.cluster === clusterIdx)}
              fill={COLORS[clusterIdx % COLORS.length]}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
