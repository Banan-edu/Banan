import { NextRequest, NextResponse } from 'next/server';
import { db } from '@server/db';
import { registrations } from '@shared/schema';
import { z } from 'zod';

const registrationSchema = z.object({
  fullName: z.string().min(1, "الاسم مطلوب"),
  gender: z.enum(['male', 'female']),
  dateOfBirth: z.string().min(1, "تاريخ الميلاد مطلوب"),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  currentTypingSpeed: z.number().optional(),
  desiredTypingSpeed: z.number().optional(),
  additionalInfo: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registrationSchema.parse(body);
    
    const [registration] = await db
      .insert(registrations)
      .values(validatedData)
      .returning();
    
    return NextResponse.json({ 
      success: true, 
      message: "تم حفظ التسجيل بنجاح",
      registration: registration,
    });
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        message: "بيانات غير صحيحة", 
        errors: error.issues 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: "حدث خطأ في الخادم" 
    }, { status: 500 });
  }
}
