import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const rollNumber = searchParams.get('rollNumber');
    const cohort = searchParams.get('cohort');

    if (!rollNumber || !cohort) {
        return NextResponse.json({ error: 'Missing rollNumber or cohort' }, { status: 400 });
    }

    try {
        const totalSessions = await prisma.session.count({
            where: { cohort }
        });

        const attended = await prisma.attendanceRecord.count({
            where: {
                rollNumber,
                session: { cohort }
            }
        });

        const percentage = totalSessions === 0 ? 100 : Math.round((attended / totalSessions) * 100);

        return NextResponse.json({
            totalSessions,
            attended,
            percentage
        });
    } catch (err: any) {
        console.error('Failed to fetch student stats:', err);
        return NextResponse.json({ error: 'Failed to fetch student stats' }, { status: 500 });
    }
}
