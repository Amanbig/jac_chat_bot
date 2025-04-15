import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const API_URL = process.env.API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/create_session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to create session');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating session:', error);
        return NextResponse.json(
            { error: 'Failed to create session' },
            { status: 500 }
        );
    }
}