//Components/mood/MoodInsights.js
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award, Target } from "lucide-react";
import { format, subDays, isWithinInterval, startOfWeek, endOfWeek } from "date-fns";

export default function MoodInsights({ entries }) {
  if (entries.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-700">
            <TrendingUp className="w-5 h-5 text-slate-500" />
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500">Track more moods to see insights</p>
        </CardContent>
      </Card>
    );
  }

  const thisWeek = entries.filter(entry =>
    isWithinInterval(new Date(entry.date), {
      start: startOfWeek(new Date()),
      end: endOfWeek(new Date())
    })
  );

  const lastWeek = entries.filter(entry =>
    isWithinInterval(new Date(entry.date), {
      start: startOfWeek(subDays(new Date(), 7)),
      end: endOfWeek(subDays(new Date(), 7))
    })
  );

  const avgMoodThisWeek = thisWeek.length > 0
    ? (thisWeek.reduce((sum, entry) => sum + entry.mood_level, 0) / thisWeek.length).toFixed(1)
    : 0;

  const avgMoodLastWeek = lastWeek.length > 0
    ? (lastWeek.reduce((sum, entry) => sum + entry.mood_level, 0) / lastWeek.length).toFixed(1)
    : 0;

  const trend = avgMoodThisWeek - avgMoodLastWeek;
  const bestMood = Math.max(...entries.map(e => e.mood_level));
  const streak = entries.length;

  const insights = [
    {
      title: "This Week",
      value: `${avgMoodThisWeek}/10`,
      subtitle: trend > 0 ? `↗️ +${trend.toFixed(1)} from last week` : trend < 0 ? `↘️ ${trend.toFixed(1)} from last week` : "Same as last week",
      color: trend >= 0 ? "text-emerald-600" : "text-orange-600",
      icon: TrendingUp
    },
    {
      title: "Best Mood",
      value: `${bestMood}/10`,
      subtitle: "Your highest recorded mood",
      color: "text-purple-600",
      icon: Award
    },
    {
      title: "Tracking Streak",
      value: `${streak} days`,
      subtitle: "Keep it up!",
      color: "text-blue-600",
      icon: Target
    }
  ];

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-700">
          <TrendingUp className="w-5 h-5 text-slate-500" />
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {insights.map((insight, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <insight.icon className={`w-4 h-4 ${insight.color}`} />
                <h4 className="font-medium text-slate-800">{insight.title}</h4>
              </div>
              <div className="pl-6">
                <p className="text-2xl font-bold text-slate-800">{insight.value}</p>
                <p className={`text-sm ${insight.color}`}>{insight.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}