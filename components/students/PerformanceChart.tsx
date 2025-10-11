
'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Target, Clock, Zap, Award, BarChart3 } from 'lucide-react';

interface PerformanceData {
    avgSpeed: number;
    avgAccuracy: number;
    totalTime: number;
    letterStats?: {
        letter: string;
        accuracy: number;
        speed: number;
        attempts: number;
        lastPracticed: string;
    }[];
    progressOverTime?: {
        date: string;
        speed: number;
        accuracy: number;
    }[];
}

interface PerformanceChartProps {
    studentId: string;
    isRTL: boolean;
}

export default function PerformanceChart({ studentId, isRTL }: PerformanceChartProps) {
    const [performance, setPerformance] = useState<PerformanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

    useEffect(() => {
        fetchPerformance();
    }, [studentId, timeRange]);

    const fetchPerformance = async () => {
        try {
            // Fetch basic performance stats
            const perfRes = await fetch(`/api/instructor/students/${studentId}/performance-chart`);
            let perfData = null;
            if (perfRes.ok) {
                perfData = await perfRes.json();
            }

            // Fetch letter-level statistics
            const lettersRes = await fetch(`/api/instructor/students/${studentId}/letters?range=${timeRange}`);
            let letterStats = [];
            if (lettersRes.ok) {
                const lettersData = await lettersRes.json();
                letterStats = lettersData.letterStats || [];
            }
            // Combine the data
            setPerformance({
                avgSpeed: perfData?.avgSpeed || 0,
                avgAccuracy: perfData?.avgAccuracy || 0,
                totalTime: perfData?.totalTime || 0,
                letterStats: letterStats,
                progressOverTime: perfData?.progressOverTime
            });
        } catch (error) {
            console.error('Error fetching performance:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <div className="text-gray-500">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>
            </div>
        );
    }

    if (!performance) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-500">
                {isRTL ? 'لا توجد بيانات' : 'No data available'}
            </div>
        );
    }

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
    };

    return (
        <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex justify-end gap-2">
                <button
                    onClick={() => setTimeRange('week')}
                    className={`px-3 py-1 rounded-lg text-sm ${timeRange === 'week'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    {isRTL ? 'أسبوع' : 'Week'}
                </button>
                <button
                    onClick={() => setTimeRange('month')}
                    className={`px-3 py-1 rounded-lg text-sm ${timeRange === 'month'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    {isRTL ? 'شهر' : 'Month'}
                </button>
                <button
                    onClick={() => setTimeRange('all')}
                    className={`px-3 py-1 rounded-lg text-sm ${timeRange === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    {isRTL ? 'الكل' : 'All'}
                </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">
                                {isRTL ? 'السرعة المتوسطة' : 'Avg Speed'}
                            </span>
                        </div>
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-900">{performance.avgSpeed} WPM</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-900">
                                {isRTL ? 'الدقة المتوسطة' : 'Avg Accuracy'}
                            </span>
                        </div>
                        <Award className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-900">{performance.avgAccuracy}%</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-600" />
                            <span className="text-sm font-medium text-purple-900">
                                {isRTL ? 'إجمالي الوقت' : 'Total Time'}
                            </span>
                        </div>
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-900">{formatTime(performance.totalTime)}</div>
                </div>
            </div>

            {/* Progress Over Time Chart */}
            {performance.progressOverTime && performance.progressOverTime.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-4">
                        {isRTL ? 'التقدم عبر الزمن' : 'Progress Over Time'}
                    </h4>
                    <div className="h-64 relative">
                        <div className="absolute inset-0 flex items-end justify-around gap-2">
                            {performance.progressOverTime.map((point, index) => {
                                const maxSpeed = Math.max(...performance.progressOverTime!.map(p => p.speed));
                                const speedHeight = (point.speed / maxSpeed) * 100;
                                const accuracyHeight = point.accuracy;

                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                                        <div className="w-full flex gap-1 items-end h-48">
                                            <div
                                                className="flex-1 bg-blue-500 rounded-t relative group"
                                                style={{ height: `${speedHeight}%` }}
                                            >
                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    {point.speed} WPM
                                                </div>
                                            </div>
                                            <div
                                                className="flex-1 bg-green-500 rounded-t relative group"
                                                style={{ height: `${accuracyHeight}%` }}
                                            >
                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    {point.accuracy}%
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-600 mt-1">
                                            {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span className="text-sm text-gray-600">{isRTL ? 'السرعة' : 'Speed'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span className="text-sm text-gray-600">{isRTL ? 'الدقة' : 'Accuracy'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Letter-Level Statistics */}
            {performance.letterStats && performance.letterStats.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-4">
                        {isRTL ? 'إحصائيات على مستوى الحروف' : 'Letter-Level Statistics'}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {performance.letterStats.map((stat, index) => {
                            const accuracyColor =
                                stat.accuracy >= 90 ? 'bg-green-100 border-green-300' :
                                    stat.accuracy >= 70 ? 'bg-yellow-100 border-yellow-300' :
                                        'bg-red-100 border-red-300';

                            return (
                                <div key={index} className={`border-2 ${accuracyColor} rounded-lg p-3 text-center`}>
                                    <div className="text-2xl font-bold mb-1">{stat.letter}</div>
                                    <div className="text-xs text-gray-600 space-y-1">
                                        <div>{stat.accuracy}% {isRTL ? 'دقة' : 'acc'}</div>
                                        <div>{stat.speed} WPM</div>
                                        <div className="text-gray-500">{stat.attempts} {isRTL ? 'محاولات' : 'tries'}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 flex justify-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-100 border-2 border-green-300 rounded"></div>
                            <span className="text-gray-600">{isRTL ? 'ممتاز (90%+)' : 'Excellent (90%+)'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
                            <span className="text-gray-600">{isRTL ? 'جيد (70-89%)' : 'Good (70-89%)'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-100 border-2 border-red-300 rounded"></div>
                            <span className="text-gray-600">{isRTL ? 'يحتاج تحسين (<70%)' : 'Needs Work (<70%)'}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
