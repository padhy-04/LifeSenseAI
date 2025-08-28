//Components/mood/MoodSelector.js
import React from 'react';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Smile, Frown, Meh, Zap, Battery } from "lucide-react";

const moodEmojis = {
  1: '😞', 2: '😔', 3: '😕', 4: '😐', 5: '🙂',
  6: '😊', 7: '😄', 8: '😁', 9: '🤩', 10: '🥳'
};

const energyEmojis = {
  1: '😴', 2: '😪', 3: '😅', 4: '🙂', 5: '😊',
  6: '😄', 7: '⚡', 8: '🔥', 9: '🚀', 10: '⭐'
};

export default function MoodSelector({ moodLevel, energyLevel, onMoodChange, onEnergyChange }) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-slate-700 font-medium mb-4 flex items-center gap-2">
          <Smile className="w-5 h-5 text-blue-500" />
          Mood Level: {moodLevel}/10 {moodEmojis[moodLevel]}
        </Label>
        <div className="px-3">
          <Slider
            value={[moodLevel]}
            onValueChange={(value) => onMoodChange(value[0])}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>Very Low</span>
            <span>Neutral</span>
            <span>Excellent</span>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-slate-700 font-medium mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Energy Level: {energyLevel}/10 {energyEmojis[energyLevel]}
        </Label>
        <div className="px-3">
          <Slider
            value={[energyLevel]}
            onValueChange={(value) => onEnergyChange(value[0])}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>Drained</span>
            <span>Balanced</span>
            <span>Energized</span>
          </div>
        </div>
      </div>
    </div>
  );
}