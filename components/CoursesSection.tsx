'use client';

import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface CoursesSectionProps {
  onRegisterClick: () => void;
}

export function CoursesSection({ onRegisterClick }: CoursesSectionProps) {
  const { isRTL } = useLanguage();

  const courses = [
    {
      title: isRTL ? 'أساسيات الطباعة باللمس' : 'Touch Typing Basics',
      description: isRTL 
        ? 'تعلم الطباعة باللمس من الصفر باللغتين العربية والإنجليزية مع تمارين تدريجية'
        : 'Learn touch typing from scratch in both Arabic and English with progressive exercises',
      level: isRTL ? 'مبتدئ' : 'Beginner',
      duration: isRTL ? '4 أسابيع' : '4 weeks',
      badgeColor: 'bg-blue-100 text-blue-800',
      image: '/images/hands_typing_on_keyb_fce410e4.jpg'
    },
    {
      title: isRTL ? 'المهارات الرقمية المتقدمة - قريباً' : 'Advanced Digital Skills - Coming Soon',
      description: isRTL
        ? 'تطوير مهارات الذكاء الاصطناعي وكتابة الأوامر والبرمجة الأساسية'
        : 'Develop AI skills, prompt writing, and basic programming abilities',
      level: isRTL ? 'متوسط' : 'Intermediate',
      duration: isRTL ? '6 أسابيع' : '6 weeks',
      badgeColor: 'bg-orange-100 text-orange-800',
      comingSoon: true,
      image: '/images/advanced_digital_ski_46a681f4.jpg'
    }
  ];

  return (
    <section id="courses" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-3xl lg:text-4xl font-bold text-gray-900 mb-4 ${isRTL ? 'arabic-heading' : ''}`}>
            {isRTL ? 'مسارات التعلم المتاحة' : 'Available Learning Paths'}
          </h2>
          <p className={`text-xl text-gray-600 ${isRTL ? 'arabic-body' : ''}`}>
            {isRTL ? 'برامج تعليمية متكاملة لجميع المستويات والأعمار' : 'Comprehensive educational programs for all levels and ages'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {courses.map((course, index) => (
            <div key={index} className={`bg-white border border-gray-200 rounded-2xl overflow-hidden transition-shadow ${course.comingSoon ? 'opacity-75' : 'hover:shadow-lg'}`}>
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                {course.comingSoon && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {isRTL ? 'قريباً' : 'Coming Soon'}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="text-center">
                  <h3 className={`text-xl font-bold text-gray-900 mb-3 ${isRTL ? 'arabic-heading' : ''}`}>{course.title}</h3>
                  <p className={`text-gray-600 mb-4 ${isRTL ? 'arabic-body' : ''}`}>{course.description}</p>
                  <div className="flex items-center justify-center gap-4">
                    <Badge className={course.badgeColor}>
                      {course.level}
                    </Badge>
                    <span className={`text-sm text-gray-500 ${isRTL ? 'arabic-body' : ''}`}>{course.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
