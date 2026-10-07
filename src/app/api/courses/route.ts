import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const professorId = searchParams.get('professorId');
    const cohort = searchParams.get('cohort');

    try {
        let courses;
        if (professorId) {
            courses = await prisma.course.findMany({
                where: { professorId },
                include: { professor: true },
                orderBy: { createdAt: 'desc' }
            });
        } else if (cohort) {
            courses = await prisma.course.findMany({
                where: { cohort },
                include: { professor: true },
                orderBy: { name: 'asc' }
            });
        } else {
            return NextResponse.json({ error: 'Missing parameter' }, { status: 400 });
        }
        return NextResponse.json(courses);
    } catch (error) {
        console.error('Failed to fetch courses:', error);
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, cohort, professorId } = body;

        if (!name || !cohort || !professorId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const course = await prisma.course.create({
            data: { name, cohort, professorId },
            include: { professor: true }
        });

        return NextResponse.json(course);
    } catch (error) {
        console.error('Failed to create course:', error);
        return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
    }
}
