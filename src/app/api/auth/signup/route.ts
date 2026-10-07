import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password, role, rollNumber, cohort } = body;

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password, // Note: No hashing for prototype simplicity
                role,
                rollNumber,
                cohort
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
    }
}
