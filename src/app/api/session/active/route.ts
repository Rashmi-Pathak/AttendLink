import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const cohort = searchParams.get('cohort');

    if (!cohort) {
        return NextResponse.json({ error: 'Cohort is required' }, { status: 400 });
    }

    try {
        const activeSessions = await prisma.session.findMany({
            where: {
                cohort,
                isActive: true,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                professorName: true,
                courseCode: true,
                createdAt: true,
                expiresAt: true,
            }
        });

        return NextResponse.json(activeSessions);
    } catch (error) {
        console.error('Error fetching active sessions:', error);
        return NextResponse.json({ error: 'Failed to fetch active sessions' }, { status: 500 });
    }
}
