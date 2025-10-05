'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Keyboard, Globe, Award, Users, BookOpen, ChevronDown, Mail, Phone, MapPin } from 'lucide-react';

export default function LandingPage() {
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  
  const [registerData, setRegisterData] = useState({
    fullName: '',
    gender: 'male' as 'male' | 'female',
    dateOfBirth: '',
    phone: '',
    email: '',
    currentTypingSpeed: '',
    desiredTypingSpeed: '',
    additionalInfo: '',
  });

  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [registerMessage, setRegisterMessage] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterMessage('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...registerData,
          currentTypingSpeed: registerData.currentTypingSpeed ? parseInt(registerData.currentTypingSpeed) : undefined,
          desiredTypingSpeed: registerData.desiredTypingSpeed ? parseInt(registerData.desiredTypingSpeed) : undefined,
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        setRegisterMessage('✅ ' + data.message);
        setRegisterData({
          fullName: '',
          gender: 'male',
          dateOfBirth: '',
          phone: '',
          email: '',
          currentTypingSpeed: '',
          desiredTypingSpeed: '',
          additionalInfo: '',
        });
        setTimeout(() => setShowRegisterForm(false), 2000);
      } else {
        setRegisterMessage('❌ ' + data.message);
      }
    } catch (error) {
      setRegisterMessage('❌ حدث خطأ في الاتصال');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setContactMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });
      const data = await res.json();
      
      if (data.success) {
        setContactMessage('✅ ' + data.message);
        setContactData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setShowContactForm(false), 2000);
      } else {
        setContactMessage('❌ ' + data.message);
      }
    } catch (error) {
      setContactMessage('❌ حدث خطأ في الاتصال');
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Keyboard className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">بَنان</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#features" className="text-gray-700 hover:text-blue-600 px-3 py-2">المميزات</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 px-3 py-2">عن المنصة</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 px-3 py-2">تواصل معنا</a>
              <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            منصة <span className="text-blue-600">بَنان</span> التعليمية
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            منصة تعليمية متكاملة لتعليم الطباعة السريعة باللمس بطريقة احترافية وممتعة
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowRegisterForm(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 shadow-lg"
            >
              سجل الآن
            </button>
            <Link 
              href="/login"
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50"
            >
              تسجيل الدخول
            </Link>
          </div>
          <div className="mt-4">
            <a href="#features" className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-2">
              اكتشف المزيد <ChevronDown className="w-5 h-5 animate-bounce" />
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">مميزات المنصة</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-blue-50 hover:shadow-lg transition">
              <Globe className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">دعم متعدد اللغات</h3>
              <p className="text-gray-600">تعلم الطباعة باللغتين العربية والإنجليزية</p>
            </div>
            <div className="text-center p-8 rounded-xl bg-indigo-50 hover:shadow-lg transition">
              <BookOpen className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">دروس متنوعة</h3>
              <p className="text-gray-600">دروس نصية ودروس برمجية مع تمييز الأكواد</p>
            </div>
            <div className="text-center p-8 rounded-xl bg-purple-50 hover:shadow-lg transition">
              <Award className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">تتبع الأداء</h3>
              <p className="text-gray-600">قياس السرعة والدقة مع تقارير مفصلة</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">عن منصة بَنان</h2>
              <p className="text-gray-600 text-lg mb-4">
                منصة بَنان هي منصة تعليمية شاملة لتعليم الطباعة السريعة باللمس. توفر المنصة تجربة تعليمية تفاعلية ومخصصة لكل متعلم.
              </p>
              <p className="text-gray-600 text-lg mb-6">
                نستخدم أحدث التقنيات لتوفير تجربة تعليمية ممتعة وفعالة، مع إمكانية تتبع التقدم وقياس الأداء بدقة.
              </p>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">1000+</div>
                  <div className="text-gray-600">طالب مسجل</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">50+</div>
                  <div className="text-gray-600">درس تفاعلي</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">98%</div>
                  <div className="text-gray-600">نسبة النجاح</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-8 h-96 flex items-center justify-center">
              <Users className="w-64 h-64 text-blue-600 opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">تواصل معنا</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">معلومات التواصل</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <div className="font-semibold">البريد الإلكتروني</div>
                    <div className="text-gray-600">info.banan@inspiration.edu.sa</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <div className="font-semibold">الهاتف</div>
                    <div className="text-gray-600">+966 XX XXX XXXX</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <div className="font-semibold">العنوان</div>
                    <div className="text-gray-600">المملكة العربية السعودية</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowContactForm(true)}
                className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                أرسل رسالة
              </button>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-4">نحن هنا للمساعدة</h3>
              <p className="text-gray-600 mb-6">
                لا تتردد في التواصل معنا لأي استفسار أو اقتراح. فريقنا جاهز للرد على جميع استفساراتك.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Keyboard className="w-6 h-6" />
            <span className="text-xl font-bold">بَنان</span>
          </div>
          <p className="text-gray-400">جميع الحقوق محفوظة © 2025</p>
        </div>
      </footer>

      {/* Registration Modal */}
      {showRegisterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full my-8">
            <h3 className="text-2xl font-bold mb-6 text-right">التسجيل في برنامج بنان - الدفعة الأولى 2025</h3>
            <form onSubmit={handleRegister} className="space-y-4" dir="rtl">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الاسم الكامل *</label>
                  <input
                    type="text"
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">الجنس *</label>
                  <select
                    value={registerData.gender}
                    onChange={(e) => setRegisterData({ ...registerData, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">تاريخ الميلاد *</label>
                  <input
                    type="date"
                    value={registerData.dateOfBirth}
                    onChange={(e) => setRegisterData({ ...registerData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">رقم الهاتف *</label>
                  <input
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">سرعة الطباعة الحالية (كلمة/دقيقة)</label>
                  <input
                    type="number"
                    value={registerData.currentTypingSpeed}
                    onChange={(e) => setRegisterData({ ...registerData, currentTypingSpeed: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">السرعة المرغوبة (كلمة/دقيقة)</label>
                  <input
                    type="number"
                    value={registerData.desiredTypingSpeed}
                    onChange={(e) => setRegisterData({ ...registerData, desiredTypingSpeed: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">معلومات إضافية</label>
                <textarea
                  value={registerData.additionalInfo}
                  onChange={(e) => setRegisterData({ ...registerData, additionalInfo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              {registerMessage && (
                <div className={`p-3 rounded-lg text-center ${registerMessage.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {registerMessage}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {registerLoading ? 'جاري الإرسال...' : 'تسجيل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6 text-right">تواصل معنا</h3>
            <form onSubmit={handleContact} className="space-y-4" dir="rtl">
              <div>
                <label className="block text-sm font-medium mb-2">الاسم *</label>
                <input
                  type="text"
                  value={contactData.name}
                  onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">البريد الإلكتروني *</label>
                <input
                  type="email"
                  value={contactData.email}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الموضوع *</label>
                <input
                  type="text"
                  value={contactData.subject}
                  onChange={(e) => setContactData({ ...contactData, subject: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الرسالة *</label>
                <textarea
                  value={contactData.message}
                  onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>
              {contactMessage && (
                <div className={`p-3 rounded-lg text-center ${contactMessage.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {contactMessage}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={contactLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {contactLoading ? 'جاري الإرسال...' : 'إرسال'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
