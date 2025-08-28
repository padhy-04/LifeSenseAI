//Components/mood/MoodHistory.js
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Calendar, Heart, Zap, Moon, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const moodColors = {
  1: 'bg-red-100 text-red-700 border-red-200',
  2: 'bg-red-100 text-red-700 border-red-200',
  3: 'bg-orange-100 text-orange-700 border-orange-200',
  4: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  5: 'bg-gray-100 text-gray-700 border-gray-200',
  6: 'bg-blue-100 text-blue-700 border-blue-200',
  7: 'bg-green-100 text-green-700 border-green-200',
  8: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  9: 'bg-purple-100 text-purple-700 border-purple-200',
  10: 'bg-pink-100 text-pink-700 border-pink-200'
};

export default function MoodHistory({ entries }) {
  if (entries.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No mood entries yet</h3>
          <p className="text-slate-500">Start tracking your daily mood to see patterns and insights.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-700">
          <Calendar className="w-5 h-5 text-slate-500" />
          Mood History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <span className="text-xl">
                      {entry.mood_level <= 3 ? '😔' : 
                       entry.mood_level <= 6 ? '😊' : '😄'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">
                      {format(parseISO(entry.date), 'EEEE, MMMM do')}
                    </h4>
                    <p className="text-sm text-slate-500">
                      {format(parseISO(entry.date), 'yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Badge className={`border ${moodColors[entry.mood_level] || moodColors[5]}`}>
                    <Heart className="w-3 h-3 mr-1" />
                    {entry.mood_level}/10
                  </Badge>
                  {entry.energy_level && (
                    <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">
                      <Zap className="w-3 h-3 mr-1" />
                      {entry.energy_level}/10
                    </Badge>
                  )}
                  {entry.sleep_hours && (
                    <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                      <Moon className="w-3 h-3 mr-1" />
                      {entry.sleep_hours}h
                    </Badge>
                  )}
                </div>
              </div>

              {entry.notes && (
                <div className="mb-3">
                  <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-slate-500 mt-0.5" />
                    <p className="text-sm text-slate-700">{entry.notes}</p>
                  </div>
                </div>
              )}

              {entry.gratitude && (
                <div className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-amber-800">
                    <span className="font-medium">Grateful for:</span> {entry.gratitude}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}