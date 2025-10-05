'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/app/contexts/LanguageContext';

export function ContactSection() {
  const { t, isRTL } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage('✅ ' + (isRTL ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been sent successfully!'));
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setMessage('❌ ' + (isRTL ? 'حدث خطأ في إرسال الرسالة' : 'Failed to send message'));
      }
    } catch (error) {
      setMessage('❌ ' + (isRTL ? 'حدث خطأ في إرسال الرسالة' : 'Failed to send message'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactInfo = [
    {
      icon: Phone,
      title: t('phone-title'),
      value: '+966 5352 666 07'
    },
    {
      icon: Mail,
      title: t('email-title'),
      value: 'hzalraee@inspiration.edu.sa'
    },
    {
      icon: MapPin,
      title: t('address-title'),
      value: t('address-text')
    }
  ];

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-3xl lg:text-4xl font-bold text-gray-900 mb-4 ${isRTL ? 'arabic-heading' : ''}`}>
            {t('contact-title')}
          </h2>
          <p className={`text-xl text-gray-600 ${isRTL ? 'arabic-body' : ''}`}>
            {t('contact-description')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="space-y-8">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div key={index} className={`flex items-start ${isRTL ? 'text-right flex-row-reverse' : 'text-left'}`}>
                    <div className={`w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center ${isRTL ? 'ml-4' : 'mr-4'}`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${isRTL ? 'arabic-heading' : ''}`}>{info.title}</h3>
                      <p className={`text-gray-600 ${isRTL ? 'arabic-body' : ''}`} dir={info.icon === Phone ? "ltr" : "auto"}>{info.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={isRTL ? 'الاسم' : 'Name'}
                required
              />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={isRTL ? 'البريد الإلكتروني' : 'Email'}
                required
              />
            </div>
            <Input
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder={isRTL ? 'الموضوع' : 'Subject'}
              required
            />
            <Textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={5}
              placeholder={isRTL ? 'الرسالة' : 'Message'}
              required
            />
            {message && (
              <div className={`p-3 rounded-lg text-center ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {isSubmitting ? (isRTL ? 'جاري الإرسال...' : 'Sending...') : t('send-message-btn')}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
