// pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { WellnessEntry } from "@/entities/WellnessEntry";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Lightbulb, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function Insights() {
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await WellnessEntry.list('-date', 14);
      setEntries(data);
      if (data.length >= 3) {
        generateInsights(data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const generateInsights = async (data) => {
    setIsLoading(true);
    try {
      const prompt = `Analyze this wellness data and provide insights:

${JSON.stringify(data)}

Provide insights in this format:
1. Overall pattern analysis (mood and energy trends)
2. Sleep impact on mood/energy
3. Activity correlations with wellbeing
4. 3 specific, actionable recommendations
5. One motivational insight

Keep each section brief and actionable.`;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            patterns: { type: "string" },
            sleep_impact: { type: "string" },
            activity_correlation: { type: "string" },
            recommendations: {
              type: "array",
              items: { type: "string" },
              minItems: 3,
              maxItems: 3
            },
            motivation: { type: "string" }
          }
        }
      });

      setInsights(result);
    } catch (error) {
      console.error("Error generating insights:", error);
    }
    setIsLoading(false);
  };

  if (entries.length < 3) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Need More Data</h2>
          <p className="text-gray-600">
            Track your wellness for at least 3 days to get AI-powered insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-4"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">AI Insights</h2>
        </div>
        <p className="text-gray-600">Personalized analysis of your wellness journey</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : insights ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Patterns */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <TrendingUp className="w-5 h-5" />
                Your Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{insights.patterns}</p>
            </CardContent>
          </Card>

          {/* Sleep Impact */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                Sleep Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{insights.sleep_impact}</p>
            </CardContent>
          </Card>

          {/* Activity Correlation */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700">
                Activity Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{insights.activity_correlation}</p>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Lightbulb className="w-5 h-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {insights.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">{index + 1}.</span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Motivation */}
          <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
            <CardContent className="p-4 text-center">
              <p className="text-pink-800 font-medium">💪 {insights.motivation}</p>
            </CardContent>
          </Card>

          <Button 
            onClick={() => generateInsights(entries)} 
            variant="outline" 
            className="w-full"
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Insights
          </Button>
        </motion.div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Button onClick={() => generateInsights(entries)} className="bg-purple-600">
              Generate AI Insights
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}