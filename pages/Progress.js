import React, { useState, useEffect } from "react";
import { WellnessEntry } from "@/entities/WellnessEntry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart3, Calendar, TrendingUp } from "lucide-react";
import { format, parseISO, subDays } from "date-fns";
import { motion } from "framer-motion";

export default function Progress() {
  const [entries, setEntries] = useState([]);
  const [timeframe, setTimeframe] = useState('week');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await WellnessEntry.list('-date', 30);
      setEntries(data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const chartData = entries
    .slice(0, timeframe === 'week' ? 7 : 30)
    .reverse()
    .map(entry => ({
      date: format(parseISO(entry.date), 'MMM dd'),
      mood: entry.mood,
      energy: entry.energy,
      sleep: entry.sleep_hours
    }));

  const averages = entries.length > 0 ? {
    mood: (entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length).toFixed(1),
    energy: (entries.reduce((sum, entry) => sum + entry.energy, 0) / entries.length).toFixed(1),
    sleep: (entries.reduce((sum, entry) => sum + entry.sleep_hours, 0) / entries.length).toFixed(1)
  } : { mood: 0, energy: 0, sleep: 0 };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.dataKey}: {item.value}
              {item.dataKey === 'sleep' ? 'h' : '/5'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-4"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Progress</h2>
        </div>
        <p className="text-gray-600">Your wellness journey over time</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-blue-600">{averages.mood}</p>
            <p className="text-xs text-gray-500">Avg Mood</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-green-600">{averages.energy}</p>
            <p className="text-xs text-gray-500">Avg Energy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-purple-600">{averages.sleep}h</p>
            <p className="text-xs text-gray-500">Avg Sleep</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trends
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeframe('week')}
                  className={`px-2 py-1 text-xs rounded ${
                    timeframe === 'week' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'
                  }`}
                >
                  7d
                </button>
                <button
                  onClick={() => setTimeframe('month')}
                  className={`px-2 py-1 text-xs rounded ${
                    timeframe === 'month' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'
                  }`}
                >
                  30d
                </button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 5]}
                  fontSize={10}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="energy" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Mood</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Energy</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Start tracking to see your progress!</p>
          </CardContent>
        </Card>
      )}

      {/* Recent Entries */}
      {entries.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {entries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">
                    {format(parseISO(entry.date), 'MMM dd')}
                  </span>
                  <div className="flex items-center gap-2 text-sm">
                    <span>😊 {entry.mood}</span>
                    <span>⚡ {entry.energy}</span>
                    <span>💤 {entry.sleep_hours}h</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}