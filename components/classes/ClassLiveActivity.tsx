'use client';

import { useState, useEffect } from 'react';

interface LiveActivityTabProps {
    classId: any;
    isRTL: boolean;
    api: string;
}

export default function LiveActivityTab({ classId, isRTL, api }: LiveActivityTabProps) {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
        const interval = setInterval(fetchActivities, 10000); // refresh every 10s
        return () => clearInterval(interval);
    }, [classId]);

    const fetchActivities = async () => {
        try {
            const res = await fetch(`/api/${api}/classes/${classId}/live-activity`);
            if (res.ok) {
                const data = await res.json();
                setActivities(data.activities || []);
            } else {
                console.error('Failed to fetch activities:', res.statusText);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    /** ✅ Formats a duration in seconds to h m s (e.g. 1h 5m 30s) */
    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
    };

    /** ✅ Displays time elapsed since timestamp (e.g. 5m 32s ago) */
    const getTimeAgo = (timestamp: string) => {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffSeconds = Math.floor((now.getTime() - activityTime.getTime()) / 1000);

        if (diffSeconds < 1) return isRTL ? 'الآن' : 'Just now';
        return isRTL
            ? `منذ ${formatTime(diffSeconds)}`
            : `${formatTime(diffSeconds)} ago`;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-8">Loading...</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                    {isRTL ? 'النشاط المباشر' : 'Live Activity Feed'}
                </h2>
                <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    <span className="text-sm">{isRTL ? 'مباشر' : 'Live'}</span>
                </div>
            </div>

            {/* Activity List */}
            <div className="space-y-3">
                {activities.length === 0 ? (
                    <div className="border rounded-lg p-8 text-gray-500 text-center">
                        {isRTL ? 'لا يوجد نشاط في الوقت الحالي' : 'No live activity at the moment'}
                    </div>
                ) : (
                    activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                            {/* Top section */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-blue-600">{activity.studentName}</span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-sm text-gray-600">{activity.courseName}</span>
                                    </div>
                                    <div className="text-sm text-gray-700">{activity.lessonName}</div>
                                </div>
                                <span className="text-xs text-gray-500">{getTimeAgo(activity.timestamp)}</span>
                            </div>

                            {/* Stats section */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-600">{isRTL ? 'النجوم:' : 'Stars:'}</span>
                                    <span className="font-semibold text-yellow-600">
                                        {'⭐'.repeat(activity.stars)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-600">{isRTL ? 'النتيجة:' : 'Score:'}</span>
                                    <span className="font-semibold">{activity.score}%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-600">{isRTL ? 'الدقة:' : 'Accuracy:'}</span>
                                    <span className="font-semibold">{activity.accuracy}%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-600">{isRTL ? 'السرعة:' : 'Speed:'}</span>
                                    <span className="font-semibold">{activity.speed} WPM</span>
                                </div>
                            </div>

                            {activity.completed && (
                                <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                    <span>✓</span>
                                    <span>{isRTL ? 'مكتمل' : 'Completed'}</span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
