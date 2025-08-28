
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Heart, 
  Home, 
  BarChart3, 
  Brain, 
  Dumbbell,
  AlertTriangle,
  MessageCircle
} from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: createPageUrl("Dashboard"), icon: Home },
    { name: "Track", path: createPageUrl("Track"), icon: Heart },
    { name: "AI Coach", path: createPageUrl("AICoach"), icon: MessageCircle },
    { name: "Fitness", path: createPageUrl("FitnessPlanner"), icon: Dumbbell },
    { name: "Health", path: createPageUrl("HealthRisk"), icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">WellnessAI Pro</h1>
                <p className="text-sm text-gray-500">ML-Powered Health Companion</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500">🔥 AI-Enhanced</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Enhanced Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t shadow-xl">
        <div className="max-w-md mx-auto px-2">
          <div className="flex justify-around py-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 min-w-0 ${
                    isActive
                      ? 'text-blue-600 bg-blue-50 scale-105'
                      : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                  <span className="text-xs mt-1 truncate w-full text-center">{item.name}</span>
                  {isActive && (
                    <div className="w-4 h-0.5 bg-blue-600 rounded-full mt-1"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

