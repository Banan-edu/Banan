
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
// import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { db } from '@server/db';
import { lessonScreenRecords, lessons, sections, classStudents, classCourses } from '@shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

// Initialize S3 Client
// const s3Client = new S3Client({
//     region: process.env.AWS_REGION || 'us-east-1',
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
//     },
// });

// const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, context:RouteContext) {
    const session = await getSession();

    if (!session || session.role !== 'student') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
const { id } = await context.params;
    const lessonId = parseInt(id);

    // Verify lesson access
    const [lesson] = await db
        .select()
        .from(lessons)
        .where(eq(lessons.id, lessonId))
        .limit(1);

    if (!lesson) {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const [section] = await db
        .select()
        .from(sections)
        .where(eq(sections.id, lesson.sectionId))
        .limit(1);

    if (!section) {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    const studentClasses = await db
        .select({ classId: classStudents.classId })
        .from(classStudents)
        .where(eq(classStudents.userId, session.userId));

    const classIds = studentClasses.map(c => c.classId);

    if (classIds.length === 0) {
        return NextResponse.json({ error: 'Not enrolled in any classes' }, { status: 403 });
    }

    const enrolledCourses = await db
        .select({ courseId: classCourses.courseId })
        .from(classCourses)
        .where(and(
            eq(classCourses.courseId, section.courseId),
            inArray(classCourses.classId, classIds)
        ));

    if (enrolledCourses.length === 0) {
        return NextResponse.json({ error: 'Not authorized to upload recordings for this lesson' }, { status: 403 });
    }

    try {
        const formData = await req.formData();
        const screenRecording = formData.get('screenRecording') as File | null;
        const cameraRecording = formData.get('cameraRecording') as File | null;
        const progressId = formData.get('progressId') ? parseInt(formData.get('progressId') as string) : null;

        let screenCloudUrl = null;
        let screenDuration = null;
        let screenFileSize = null;
        let cameraCloudUrl = null;
        let cameraDuration = null;
        let cameraFileSize = null;

        // Upload screen recording to S3
        if (screenRecording) {
            const screenKey = `recordings/${session.userId}/lesson-${lessonId}/screen-${Date.now()}.webm`;
            const screenBuffer = Buffer.from(await screenRecording.arrayBuffer());

            // const screenUpload = new Upload({
            //     client: s3Client,
            //     params: {
            //         Bucket: BUCKET_NAME,
            //         Key: screenKey,
            //         Body: screenBuffer,
            //         ContentType: screenRecording.type,
            //     },
            // });

            // await screenUpload.done();
            screenCloudUrl = `https://bucketName.s3.amazonaws.com/${screenKey}`//`https://${BUCKET_NAME}.s3.amazonaws.com/${screenKey}`;
            screenFileSize = screenRecording.size;
            screenDuration = parseInt(formData.get('screenDuration') as string) || null;
        }

        // Upload camera recording to S3
        if (cameraRecording) {
            const cameraKey = `recordings/${session.userId}/lesson-${lessonId}/camera-${Date.now()}.webm`;
            const cameraBuffer = Buffer.from(await cameraRecording.arrayBuffer());

            // const cameraUpload = new Upload({
            //     client: s3Client,
            //     params: {
            //         Bucket: BUCKET_NAME,
            //         Key: cameraKey,
            //         Body: cameraBuffer,
            //         ContentType: cameraRecording.type,
            //     },
            // });

            // await cameraUpload.done();
            cameraCloudUrl = `https://bucketName.s3.amazonaws.com/${cameraKey}`//`https://${BUCKET_NAME}.s3.amazonaws.com/${cameraKey}`;
            cameraFileSize = cameraRecording.size;
            cameraDuration = parseInt(formData.get('cameraDuration') as string) || null;
        }

        // Save recording metadata to database
        const [record] = await db
            .insert(lessonScreenRecords)
            .values({
                userId: session.userId,
                lessonId,
                progressId,
                screenCloudUrl,
                screenDuration,
                screenFileSize,
                cameraCloudUrl,
                cameraDuration,
                cameraFileSize,
                cloudProvider: 'aws-s3',
            })
            .returning();

        return NextResponse.json({
            success: true,
            record,
        });
    } catch (error) {
        console.error('Recording upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload recordings' },
            { status: 500 }
        );
    }
}
