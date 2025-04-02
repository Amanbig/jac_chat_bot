interface SessionResponse {
    session_id: string;
}

interface AskResponse {
    session_id: string;
    question: string;
    response: string;
    sources: Array<{
        source: string;
        type: string;
        relevance: number;
        content_preview: string;
        page: number;
        section: string;
    }>;
}

export async function createSession(): Promise<string> {
    try {
        const response = await fetch('http://localhost:8000/create_session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to create session');
        }

        const data: SessionResponse = await response.json();
        return data.session_id;
    } catch (error) {
        console.error('Error creating session:', error);
        throw error;
    }
}

export async function askQuestion(sessionId: string, question: string): Promise<AskResponse> {
    try {
        const response = await fetch('http://localhost:8000/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: sessionId,
                question: question,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to get response');
        }

        const data: AskResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error asking question:', error);
        throw error;
    }
}