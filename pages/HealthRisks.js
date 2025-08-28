
import React, { useState, useEffect } from "react";
import { HealthMetrics, WellnessEntry } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  Heart, 
  Activity, 
  Shield, 
  TrendingDown, 
  TrendingUp,
  Target,
  Brain
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function HealthRisk() {
  const [healthData, setHealthData] = useState({
    weight: 70,
    height: 170,
    age: 25,
    blood_pressure: { systolic: 120, diastolic: 80 },
    heart_rate: 70,
    steps: 8000,
    water_intake: 2.5,
    stress_level: 5,
    sleep_quality: 7,
    chronic_conditions: [],
    medications: []
  });
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      const [healthMetrics, wellnessData] = await Promise.all([
        HealthMetrics.list('-date', 1),
        WellnessEntry.list('-date', 7)
      ]);

      if (healthMetrics.length > 0) {
        setHealthData({ ...healthData, ...healthMetrics[0] });
        setShowForm(false);
        analyzeHealthRisk({ ...healthData, ...healthMetrics[0] }, wellnessData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const analyzeHealthRisk = async (metrics = healthData, wellnessData = []) => {
    setIsAnalyzing(true);
    
    try {
      const bmi = metrics.weight / ((metrics.height / 100) ** 2);
      const avgMood = wellnessData.length > 0 
        ? wellnessData.reduce((sum, entry) => sum + entry.mood, 0) / wellnessData.length 
        : 3;

      const prompt = `Analyze health risk based on this data:

Physical Metrics:
- Age: ${metrics.age}
- BMI: ${bmi.toFixed(1)}
- Blood Pressure: ${metrics.blood_pressure?.systolic}/${metrics.blood_pressure?.diastolic}
- Resting Heart Rate: ${metrics.heart_rate}
- Daily Steps: ${metrics.steps}
- Water Intake: ${metrics.water_intake}L
- Sleep Quality: ${metrics.sleep_quality}/10
- Stress Level: ${metrics.stress_level}/10
- Average Mood: ${avgMood.toFixed(1)}/5

Chronic Conditions: ${metrics.chronic_conditions?.join(', ') || 'None'}
Current Medications: ${metrics.medications?.join(', ') || 'None'}

Provide:
1. Risk assessment for diabetes, hypertension, obesity, heart disease
2. Overall health score (0-100)
3. Top 3 specific recommendations
4. Positive reinforcement for good metrics
5. Early warning signs to watch for

Use medical knowledge but keep language accessible.`;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            risks: {
              type: "object",
              properties: {
                diabetes: { type: "object", properties: { level: { type: "string" }, percentage: { type: "number" } } },
                hypertension: { type: "object", properties: { level: { type: "string" }, percentage: { type: "number" } } },
                obesity: { type: "object", properties: { level: { type: "string" }, percentage: { type: "number" } } },
                heart_disease: { type: "object", properties: { level: { type: "string" }, percentage: { type: "number" } } }
              }
            },
            overall_score: { type: "number" },
            recommendations: { type: "array", items: { type: "string" } },
            positive_points: { type: "array", items: { type: "string" } },
            warning_signs: { type: "array", items: { type: "string" } },
            summary: { type: "string" }
          }
        }
      });

      setRiskAssessment(result);
      setRecommendations(result.recommendations || []);
    } catch (error) {
      console.error("Error analyzing health risk:", error);
    }
    setIsAnalyzing(false);
  };

  const saveHealthData = async () => {
    try {
      await HealthMetrics.create({
        ...healthData,
        date: format(new Date(), 'yyyy-MM-dd')
      });
      setShowForm(false);
      analyzeHealthRisk();
    } catch (error) {
      console.error("Error saving health data:", error);
    }
  };

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRiskIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return <Shield className="w-4 h-4" />;
      case 'moderate': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (showForm) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="text-center py-4 mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">Health Risk Assessment</h1>
          </div>
          <p className="text-gray-600">Get AI-powered insights about your health risks</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Health Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Age</Label>
                <Input
                  type="number"
                  value={healthData.age}
                  onChange={(e) => setHealthData({...healthData, age: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  value={healthData.weight}
                  onChange={(e) => setHealthData({...healthData, weight: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label>Height (cm)</Label>
                <Input
                  type="number"
                  value={healthData.height}
                  onChange={(e) => setHealthData({...healthData, height: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label>Resting Heart Rate</Label>
                <Input
                  type="number"
                  value={healthData.heart_rate}
                  onChange={(e) => setHealthData({...healthData, heart_rate: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <Label>Blood Pressure</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Systolic"
                  value={healthData.blood_pressure.systolic}
                  onChange={(e) => setHealthData({
                    ...healthData,
                    blood_pressure: { ...healthData.blood_pressure, systolic: parseInt(e.target.value) }
                  })}
                />
                <Input
                  type="number"
                  placeholder="Diastolic"
                  value={healthData.blood_pressure.diastolic}
                  onChange={(e) => setHealthData({
                    ...healthData,
                    blood_pressure: { ...healthData.blood_pressure, diastolic: parseInt(e.target.value) }
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Daily Steps</Label>
                <Input
                  type="number"
                  value={healthData.steps}
                  onChange={(e) => setHealthData({...healthData, steps: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label>Water Intake (L)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={healthData.water_intake}
                  onChange={(e) => setHealthData({...healthData, water_intake: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            <Button onClick={saveHealthData} className="w-full bg-red-600 hover:bg-red-700">
              <Brain className="w-4 h-4 mr-2" />
              Analyze My Health Risks
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-red-600 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Your Health</h3>
          <p className="text-gray-600">AI is evaluating your health metrics and calculating risk factors...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Heart className="w-8 h-8 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-900">Health Assessment</h1>
        </div>
        <p className="text-gray-600">AI-powered risk analysis</p>
      </div>

      {/* Overall Health Score */}
      <Card className={`${riskAssessment?.overall_score >= 80 ? 'bg-green-50 border-green-200' : 
                             riskAssessment?.overall_score >= 60 ? 'bg-yellow-50 border-yellow-200' : 
                             'bg-red-50 border-red-200'}`}>
        <CardContent className="p-6 text-center">
          <div className="text-4xl font-bold mb-2">
            {riskAssessment?.overall_score}/100
          </div>
          <div className="text-lg font-medium mb-3">Overall Health Score</div>
          <Progress value={riskAssessment?.overall_score} className="mb-3" />
          <p className="text-sm text-gray-600">{riskAssessment?.summary}</p>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {riskAssessment?.risks && Object.entries(riskAssessment.risks).map(([condition, risk]) => (
              <div key={condition} className="flex justify-between items-center p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  {getRiskIcon(risk.level)}
                  <span className="font-medium capitalize">
                    {condition.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{risk.percentage}%</span>
                  <Badge className={`border ${getRiskColor(risk.level)}`}>
                    {risk.level}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Positive Points */}
      {riskAssessment?.positive_points?.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="w-5 h-5" />
              What You're Doing Well
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {riskAssessment.positive_points.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </div>
                <span className="text-blue-800 text-sm">{rec}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Warning Signs */}
      {riskAssessment?.warning_signs?.length > 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              Watch For These Signs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {riskAssessment.warning_signs.map((sign, index) => (
                <li key={index} className="flex items-start gap-2 text-orange-700">
                  <AlertTriangle className="w-4 h-4 mt-0.5" />
                  <span className="text-sm">{sign}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Button 
        onClick={() => setShowForm(true)} 
        variant="outline" 
        className="w-full"
      >
        Update Health Data
      </Button>
    </div>
  );
}