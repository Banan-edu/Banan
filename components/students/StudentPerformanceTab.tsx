
'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Calendar, TrendingUp } from 'lucide-react';

type TimeFrame = 'day' | 'week' | 'month';

interface PerformanceData {
  avgSpeed: number;
  avgAccuracy: number;
  totalTime: number;
  coverage: number;
  chartData: {
    label: string;
    accuracy: number;
    coverage: number;
    speed: number;
    practice: number;
  }[];
}

interface StudentPerformanceTabProps {
  studentId: string;
  isRTL: boolean;
}

export function StudentPerformanceTab({ studentId, isRTL }: StudentPerformanceTabProps) {
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('week');

  useEffect(() => {
    fetchPerformance();
  }, [studentId, timeFrame]);

  const fetchPerformance = async () => {
    try {
      const res = await fetch(`/api/instructor/students/${studentId}/performance?timeFrame=${timeFrame}`);
      if (res.ok) {
        const data = await res.json();
        setPerformance(data);
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div>Loading...</div>;

  const maxValue = performance?.chartData 
    ? Math.max(...performance.chartData.flatMap(d => [d.accuracy, d.coverage, d.speed, d.practice]))
    : 100;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
          <div className="text-sm text-blue-600 font-medium mb-2">{isRTL ? 'السرعة' : 'Speed'}</div>
          <div className="text-3xl font-bold text-blue-900">{performance?.avgSpeed || 0} WPM</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
          <div className="text-sm text-green-600 font-medium mb-2">{isRTL ? 'الدقة' : 'Accuracy'}</div>
          <div className="text-3xl font-bold text-green-900">{performance?.avgAccuracy || 0}%</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
          <div className="text-sm text-purple-600 font-medium mb-2">{isRTL ? 'الوقت الإجمالي' : 'Total Time'}</div>
          <div className="text-3xl font-bold text-purple-900">
            {formatTime(performance?.totalTime || 0)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
          <div className="text-sm text-orange-600 font-medium mb-2">{isRTL ? 'التغطية' : 'Coverage'}</div>
          <div className="text-3xl font-bold text-orange-900">{performance?.coverage || 0}%</div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {isRTL ? 'نظرة عامة على التقدم' : 'Progress Overview'}
          </h3>
          
          {/* Time Frame Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setTimeFrame('day')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFrame === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isRTL ? 'يوم' : 'Day'}
            </button>
            <button
              onClick={() => setTimeFrame('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFrame === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isRTL ? 'أسبوع' : 'Week'}
            </button>
            <button
              onClick={() => setTimeFrame('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFrame === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isRTL ? 'شهر' : 'Month'}
            </button>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex gap-4 justify-center flex-wrap text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>{isRTL ? 'الدقة' : 'Accuracy'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>{isRTL ? 'التغطية' : 'Coverage'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>{isRTL ? 'السرعة (كلمة/دقيقة)' : 'Speed (WPM)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span>{isRTL ? 'التمرين (دقائق)' : 'Practice (min)'}</span>
            </div>
          </div>

          {/* Chart */}
          <div className="relative h-80 border-l border-b border-gray-300 pt-4">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
              <span>{maxValue}</span>
              <span>{Math.round(maxValue * 0.75)}</span>
              <span>{Math.round(maxValue * 0.5)}</span>
              <span>{Math.round(maxValue * 0.25)}</span>
              <span>0</span>
            </div>

            {/* Bars */}
            <div className="ml-12 h-full flex items-end justify-around gap-2">
              {performance?.chartData && performance.chartData.length > 0 ? (
                performance.chartData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      {/* Accuracy Bar */}
                      <div
                        className="bg-green-500 rounded-t w-full transition-all hover:bg-green-600"
                        style={{ height: `${(data.accuracy / maxValue) * 100}%` }}
                        title={`${isRTL ? 'الدقة' : 'Accuracy'}: ${data.accuracy}%`}
                      ></div>
                      {/* Coverage Bar */}
                      <div
                        className="bg-orange-500 rounded-t w-full transition-all hover:bg-orange-600"
                        style={{ height: `${(data.coverage / maxValue) * 100}%` }}
                        title={`${isRTL ? 'التغطية' : 'Coverage'}: ${data.coverage}%`}
                      ></div>
                      {/* Speed Bar */}
                      <div
                        className="bg-blue-500 rounded-t w-full transition-all hover:bg-blue-600"
                        style={{ height: `${(data.speed / maxValue) * 100}%` }}
                        title={`${isRTL ? 'السرعة' : 'Speed'}: ${data.speed} WPM`}
                      ></div>
                      {/* Practice Bar */}
                      <div
                        className="bg-purple-500 rounded-t w-full transition-all hover:bg-purple-600"
                        style={{ height: `${(data.practice / maxValue) * 100}%` }}
                        title={`${isRTL ? 'التمرين' : 'Practice'}: ${data.practice} min`}
                      ></div>
                    </div>
                    {/* Label */}
                    <span className="text-xs text-gray-600 text-center whitespace-nowrap">
                      {data.label}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full w-full text-gray-500">
                  {isRTL ? 'لا توجد بيانات' : 'No data available'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
