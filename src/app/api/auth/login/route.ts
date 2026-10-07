import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.password !== password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Extremely basic auth for prototype (returning the user object)
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
