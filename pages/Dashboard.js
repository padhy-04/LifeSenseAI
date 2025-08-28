// pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { WellnessEntry } from "@/entities/WellnessEntry";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Heart, TrendingUp, Target, Sparkles, ArrowRight } from "lucide-react";
import { format, subDays } from "date-fns";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [todayEntry, setTodayEntry] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [aiInsight, setAiInsight] = useState("");
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const entries = await WellnessEntry.list('-date', 10);
      const today = format(new Date(), 'yyyy-MM-dd');
      const todaysEntry = entries.find(entry => entry.date === today);
      
      setTodayEntry(todaysEntry);
      setRecentEntries(entries.slice(0, 5));
      
      if (entries.length > 0) {
        generateAIInsight(entries.slice(0, 7));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const generateAIInsight = async (entries) => {
    setIsLoadingInsight(true);
    try {
      const prompt = `Based on this user's recent wellness data, provide a brief, encouraging insight and one specific recommendation:

Recent entries: ${JSON.stringify(entries)}

Provide a response with:
1. A brief observation about their wellness pattern
2. One specific, actionable recommendation
3. Keep it positive and supportive (max 100 words)`;

      const result = await InvokeLLM({ 
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            insight: { type: "string" },
            recommendation: { type: "string" }
          }
        }
      });
      
      setAiInsight(result);
    } catch (error) {
      console.error("Error generating AI insight:", error);
      setAiInsight({
        insight: "Keep tracking your wellness journey!",
        recommendation: "Consistency is key to understanding your patterns."
      });
    }
    setIsLoadingInsight(false);
  };

  const moodEmoji = (mood) => {
    const emojis = ['😢', '😕', '😐', '😊', '😄'];
    return emojis[mood - 1] || '😐';
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!
        </h2>
        <p className="text-gray-600">{format(new Date(), 'EEEE, MMMM do')}</p>
      </motion.div>

      {/* Today's Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            {todayEntry ? (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Today's Check-in ✓</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{moodEmoji(todayEntry.mood)}</span>
                    <div>
                      <p className="text-sm opacity-90">Mood: {todayEntry.mood}/5</p>
                      <p className="text-sm opacity-90">Energy: {todayEntry.energy}/5</p>
                    </div>
                  </div>
                </div>
                <Heart className="w-8 h-8" />
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Ready to check in?</h3>
                <p className="text-sm opacity-90 mb-4">Track your mood and get AI insights</p>
                <Link to={createPageUrl("Track")}>
                  <Button className="bg-white text-blue-600 hover:bg-gray-100">
                    Check In Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Insight */}
      {(aiInsight || isLoadingInsight) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Sparkles className="w-5 h-5" />
                AI Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingInsight ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-orange-200 rounded w-full"></div>
                  <div className="h-4 bg-orange-200 rounded w-3/4"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-orange-800">{aiInsight.insight}</p>
                  <div className="bg-white/50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-orange-900">
                      💡 {aiInsight.recommendation}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-4"
      >
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{recentEntries.length}</p>
            <p className="text-sm text-gray-500">Days Tracked</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {recentEntries.length > 0 
                ? Math.round(recentEntries.reduce((sum, entry) => sum + entry.mood, 0) / recentEntries.length * 10) / 10
                : 0}
            </p>
            <p className="text-sm text-gray-500">Avg Mood</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      {recentEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEntries.slice(0, 3).map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{moodEmoji(entry.mood)}</span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {format(new Date(entry.date), 'MMM dd')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Mood: {entry.mood}/5 • Energy: {entry.energy}/5
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}