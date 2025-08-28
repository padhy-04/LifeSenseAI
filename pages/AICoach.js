// pages/AICoach.js 
import React, { useState, useEffect } from "react";
import { WellnessEntry, HealthMetrics, HabitStreak } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  Award,
  Heart
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function AICoach() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [quickActions, setQuickActions] = useState([]);

  useEffect(() => {
    loadUserData();
    initializeChat();
  }, []);

  const loadUserData = async () => {
    try {
      const [wellness, health, habits] = await Promise.all([
        WellnessEntry.list('-date', 7),
        HealthMetrics.list('-date', 7),
        HabitStreak.list()
      ]);

      const profile = {
        recentWellness: wellness,
        healthMetrics: health,
        habits: habits,
        totalPoints: habits.reduce((sum, h) => sum + (h.reward_points || 0), 0)
      };
      
      setUserProfile(profile);
      generateQuickActions(profile);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const generateQuickActions = (profile) => {
    const actions = [
      "Create workout plan",
      "Suggest healthy meals",
      "Analyze my progress",
      "Check health risks",
      "Improve sleep",
      "Stress management tips"
    ];
    setQuickActions(actions);
  };

  const initializeChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      content: "Hello! I'm your AI Wellness Coach 🤖\n\nI've analyzed your recent data and I'm here to help you achieve your health goals. What would you like to work on today?",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const prompt = `You are an AI wellness coach. User message: "${messageText}"

User's recent data:
${JSON.stringify(userProfile, null, 2)}

Provide a helpful, personalized response as a wellness coach. Include:
1. Acknowledge their message
2. Provide specific, actionable advice
3. Use encouraging tone
4. Include relevant data insights if applicable
5. Suggest next steps

Keep response concise but comprehensive (max 200 words).`;

      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            message: { type: "string" },
            action_items: {
              type: "array",
              items: { type: "string" }
            },
            insights: { type: "string" }
          }
        }
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.message,
        actionItems: response.action_items,
        insights: response.insights,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error generating AI response:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm having trouble connecting right now. Please try again in a moment!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };

  const handleQuickAction = (action) => {
    sendMessage(action);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">AI Wellness Coach</h1>
            <p className="text-sm opacity-90">Your personal health companion</p>
          </div>
        </div>
        
        {userProfile && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">{userProfile.totalPoints} Points</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">
                {userProfile.habits.filter(h => h.current_streak > 0).length} Active Streaks
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b bg-white">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action)}
              className="text-xs"
            >
              {action}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className={message.type === 'ai' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}>
                  {message.type === 'ai' ? <Bot className="w-4 h-4" /> : 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'items-end' : ''}`}>
                <Card className={`${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-white border'}`}>
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {message.actionItems && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold opacity-75">Action Items:</p>
                        {message.actionItems.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Target className="w-3 h-3" />
                            <span className="text-xs">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {message.insights && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles className="w-3 h-3 text-yellow-600" />
                          <span className="text-xs font-semibold text-yellow-800">Insight</span>
                        </div>
                        <p className="text-xs text-yellow-700">{message.insights}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <p className="text-xs text-gray-400 mt-1 px-2">
                  {format(message.timestamp, 'HH:mm')}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <Card className="bg-white border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">AI is thinking...</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything about your wellness..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1"
          />
          <Button 
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}