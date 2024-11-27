import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Sample data - you can modify these values
const generateSampleData = (days = 30) => {
  const data = [];
  let basePrice = 150;  // Starting price
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Create some random price movement
    const change = (Math.random() - 0.5) * 5;
    basePrice += change;
    
    data.push({
      date: date.toLocaleDateString(),
      price: parseFloat(basePrice.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 500000
    });
  }
  return data;
};

const StockChart = ({ selectedStock = 'SAMPLE' }) => {
  const data = generateSampleData();

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Stock Price: {selectedStock}</h3>
      <div className="h-[400px]"> {/* Fixed height container */}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval={6} // Show every 7th date
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              formatter={(value) => [`$${value}`, 'Price']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#8884d8"
              name="Stock Price"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockChart;