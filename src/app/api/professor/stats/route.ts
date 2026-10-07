import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const courseCode = searchParams.get('courseCode');

    if (!courseCode) {
        return NextResponse.json({ error: 'Missing courseCode' }, { status: 400 });
    }

    try {
        const sessions = await prisma.session.findMany({
            where: { courseCode },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { attendees: true }
        });

        const stats = sessions.reverse().map(s => ({
            date: new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            attendees: s.attendees.length
        }));

        return NextResponse.json(stats);
    } catch (err: any) {
        console.error('Failed to fetch professor stats:', err);
        return NextResponse.json({ error: 'Failed to fetch professor insights' }, { status: 500 });
    }
}
