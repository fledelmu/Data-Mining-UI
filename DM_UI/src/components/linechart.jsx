import React, { useEffect, useState } from "react";
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

import { forecast, getNames } from "./api";

export default function LineChart() {
  const [names, setNames] = useState([]); // dynamically loaded names
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState("");

  const handleChange = (e) => {
    setSelectedStore(e.target.value);
    console.log("Selected store:", e.target.value);
  };

  useEffect(() => {
  const loadNames = async () => {
    try {
        const response = await getNames();
        console.log("Raw response from backend:", response);
        
        const namesArray = response.names; // <-- extract the 'names' field
        console.log("Names received from backend:", namesArray);

        setNames(namesArray.map(name => ({ name })));
        setSelectedStore(namesArray[0] || "");
      } catch (error) {
        console.error("Error fetching store names:", error);
      }
    };

    loadNames();
  }, []);


  // Forecast logic stays exactly the same
  useEffect(() => {
  const loadForecast = async () => {
    if (!selectedStore) return;

    setLoading(true); // start loading

    try {
      const result = await forecast(selectedStore, 12); // pass selected store
      console.log("Forecast data:", result);

        if (result.result?.forecast) {
            const formattedData = result.result.forecast
              .map(item => ({
                ds: new Date(item.ds), // keep as Date object
                y2025: item.yhat,
                y2024: item.y_actual,
                lower: item.yhat_lower,
                upper: item.yhat_upper,
              }))
              .sort((a, b) => a.ds - b.ds); // chronological order
          setData(formattedData);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Forecast failed:", error);
        setData([]);
      } finally {
        setLoading(false); // stop loading
      }
    };

  loadForecast();
}, [selectedStore]);



  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full text-white">
        Loading forecast...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full text-red-400">
        Failed to load forecast data.
      </div>
    );
  }




  return (
    <div className="flex flex-col items-left justify-center h-full w-full gap-2 rounded-2xl bg-gray-500 p-4 overflow-hidden">
      {/* Dropdown populated from API */}
      <select
        id="store-select"
        value={selectedStore}
        onChange={handleChange}
        className="w-[200px] h-[50px] rounded text-black bg-gray-200"
      >
        {names.map((item, index) => (
          <option key={index} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>

      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={data}>
          <CartesianGrid stroke="#9ca3af" strokeDasharray="3 3" />
          <XAxis
            dataKey="ds"
            stroke="#f9fafb"
            tickFormatter={(str) => {
              const date = new Date(str + "-01"); // append day to parse
              return date.toLocaleString("default", { month: "short" });
            }}
          />
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

          <Area type="monotone" dataKey="upper" stroke="none" fill="rgba(250, 204, 21, 0.2)" />
          <Area type="monotone" dataKey="lower" stroke="none" fill="rgba(250, 204, 21, 0.2)" />

          <Line type="monotone" dataKey="y2024" name="Actual 2024" stroke="#3b82f6" dot={false} strokeWidth={3} />
          <Line type="monotone" dataKey="y2025" name="Forecast 2025" stroke="#facc15" dot={false} strokeWidth={3} strokeDasharray="5 5" />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}
