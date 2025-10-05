import { NextRequest, NextResponse } from 'next/server';
import { db } from '@server/db';
import { contactMessages } from '@shared/schema';
import { z } from 'zod';

const contactMessageSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  subject: z.string().min(1, "الموضوع مطلوب"),
  message: z.string().min(1, "الرسالة مطلوبة"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = contactMessageSchema.parse(body);
    
    const [contactMessage] = await db
      .insert(contactMessages)
      .values(validatedData)
      .returning();
    
    return NextResponse.json({ 
      success: true, 
      message: "تم استلام رسالتك بنجاح",
      contactMessage: contactMessage,
    });
  } catch (error) {
    console.error("Contact form error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        message: "بيانات غير صحيحة", 
        errors: error.issues 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: "حدث خطأ في إرسال الرسالة" 
    }, { status: 500 });
  }
}
