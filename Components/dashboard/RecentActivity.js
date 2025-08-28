//Components/dashboard/RecentActivity.js
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Clock, BookOpen, Smile, CheckCircle } from "lucide-react";

export default function RecentActivity({ journalEntries, moodEntries, habitLogs }) {
  const allActivities = [
    ...journalEntries.map(entry => ({
      type: 'journal',
      title: entry.title,
      date: entry.date,
      icon: BookOpen,
      color: 'bg-rose-100 text-rose-700',
      mood: entry.mood
    })),
    ...moodEntries.map(entry => ({
      type: 'mood',
      title: `Mood: ${entry.mood_level}/10`,
      date: entry.date,
      icon: Smile,
      color: 'bg-blue-100 text-blue-700',
      notes: entry.notes
    })),
    ...habitLogs.slice(0, 3).map(log => ({
      type: 'habit',
      title: log.habit_name,
      date: log.date,
      icon: CheckCircle,
      color: log.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700',
      completed: log.completed
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-700">
          <Clock className="w-5 h-5 text-slate-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allActivities.length > 0 ? (
            allActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className={`p-2 rounded-lg ${activity.color}`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">
                    {activity.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-slate-500">
                      {format(parseISO(activity.date), 'MMM dd, h:mm a')}
                    </p>
                    {activity.mood && (
                      <Badge variant="outline" className="text-xs">
                        {activity.mood}
                      </Badge>
                    )}
                    {activity.completed !== undefined && (
                      <Badge 
                        variant={activity.completed ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {activity.completed ? "Done" : "Missed"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">No recent activity</p>
              <p className="text-sm text-slate-400 mt-1">
                Start tracking your wellness journey
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}