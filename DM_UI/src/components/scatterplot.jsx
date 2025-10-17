import React, { useEffect, useState } from "react";
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
import { clustering } from './api';

export default function ClusterScatterPlot() {
  const [customerData, setCustomerData] = useState([]);
  const best_k = 10;

  const COLORS = [
    "#FFB703", "#8ECAE6", "#FB8500", "#90EE90", "#FF69B4",
    "#FFD700", "#ADFF2F", "#40E0D0", "#FF7F50", "#E0FFFF"
  ];

  // ✅ Fetch clusters from API once
  useEffect(() => {
    const loadClusters = async () => {
      try {
        const result = await clustering(); 
        console.log("Clustering API result:", result);
        setCustomerData(result.clusters || []); // only set the clusters array
      } catch (error) {
        console.error("Error fetching clustering data:", error);
        setCustomerData([]);
      }
    };

    loadClusters();
  }, []);

  return (
    <div className="h-[500px] w-full bg-gray-500 p-4 rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
          <XAxis
            dataKey="Amount"
            name="Total Sales"
            tick={{ fill: "#ffffff" }}
            label={{ value: "Total Sales", position: "insideBottom", fill: "#ffffff", dy: 10 }}
          />
          <YAxis
            dataKey="Qty"
            name="Total Quantity"
            tick={{ fill: "#ffffff" }}
            label={{ value: "Total Quantity", angle: -90, position: "insideLeft", fill: "#ffffff" }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div style={{ backgroundColor: "#1f2937", padding: "10px", color: "#ffffff", borderRadius: "6px" }}>
                    <p><strong>Cluster:</strong> {payload[0].payload.Cluster_Sales}</p>
                    <p><strong>Name:</strong> {payload[0].payload.Name}</p>
                    <p><strong>Total Sales:</strong> {payload[0].payload.Amount}</p>
                    <p><strong>Total Qty:</strong> {payload[0].payload.Qty}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend wrapperStyle={{ color: "#ffffff" }} />
          {[...Array(best_k).keys()].map((clusterIdx) => (
            <Scatter
              key={clusterIdx}
              name={`Cluster ${clusterIdx}`}
              data={customerData.filter((c) => c.Cluster_Sales === clusterIdx)} // match your backend field
              fill={COLORS[clusterIdx % COLORS.length]}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
