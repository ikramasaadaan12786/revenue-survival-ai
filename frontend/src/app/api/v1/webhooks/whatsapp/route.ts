import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const configuredToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token && configuredToken && token === configuredToken) {
    // Return exact plain text challenge as required by Meta WhatsApp Cloud API
    return new Response(challenge || '', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }

  return new Response('Verification failed: token mismatch or invalid mode', {
    status: 403,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    // Forward to internal backend webhook handler if available
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl) {
      const cleanBase = backendUrl.replace(/\/api\/v1\/?$/, '');
      fetch(`${cleanBase}/api/v1/webhooks/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch((e) => console.error('Error forwarding webhook to backend:', e));
    }

    // Acknowledge receipt to Meta immediately with HTTP 200
    return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}
