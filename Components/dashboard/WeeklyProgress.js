//Components/dashboard/WeeklyProgress.js
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Target, CheckSquare, Smile } from "lucide-react";

export default function WeeklyProgress({ moodEntries, habitLogs, goals }) {
  const moodGoal = 5;
  const habitGoal = 7;
  
  const completedHabits = habitLogs.filter(log => log.completed).length;
  const moodProgress = (moodEntries.length / moodGoal) * 100;
  const habitProgress = (completedHabits / habitGoal) * 100;
  
  const averageMood = moodEntries.length > 0 
    ? moodEntries.reduce((sum, entry) => sum + entry.mood_level, 0) / moodEntries.length 
    : 0;

  const progressItems = [
    {
      title: "Mood Check-ins",
      current: moodEntries.length,
      goal: moodGoal,
      progress: moodProgress,
      icon: Smile,
      color: "from-blue-500 to-blue-600",
      subtitle: `Avg: ${averageMood.toFixed(1)}/10`
    },
    {
      title: "Completed Habits",
      current: completedHabits,
      goal: habitGoal,
      progress: habitProgress,
      icon: CheckSquare,
      color: "from-emerald-500 to-emerald-600",
      subtitle: `${habitLogs.length} total logs`
    },
    {
      title: "Active Goals",
      current: goals.length,
      goal: goals.length || 1,
      progress: 100,
      icon: Target,
      color: "from-purple-500 to-purple-600",
      subtitle: "Stay focused"
    }
  ];

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-700">
          <CalendarDays className="w-5 h-5 text-slate-500" />
          This Week's Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {progressItems.map((item, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color}`}>
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">{item.title}</h4>
                    <p className="text-sm text-slate-500">{item.subtitle}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-600">
                  {item.current}/{item.goal}
                </span>
              </div>
              <Progress 
                value={Math.min(item.progress, 100)} 
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}