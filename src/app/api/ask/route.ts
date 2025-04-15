import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { session_id, question } = body;

        if (!session_id || !question) {
            return NextResponse.json(
                { error: 'Session ID and question are required' },
                { status: 400 }
            );
        }

        const API_URL = process.env.API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id,
                question,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to get response');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error asking question:', error);
        return NextResponse.json(
            { error: 'Failed to get response' },
            { status: 500 }
        );
    }
}