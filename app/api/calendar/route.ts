import { NextResponse } from 'next/server';

const TENANT_ID  = process.env.AZURE_TENANT_ID;
const CLIENT_ID  = process.env.AZURE_CLIENT_ID;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
const GROUP_ID   = 'f4d365f3-afc6-4fec-acb8-ba03537a31f1';

async function getAccessToken(): Promise<string> {
  const res = await fetch(
    `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'client_credentials',
        client_id:     CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        scope:         'https://graph.microsoft.com/.default',
      }),
    }
  );
  const data = await res.json();
  if (!data.access_token) throw new Error('Token fetch failed: ' + JSON.stringify(data));
  return data.access_token;
}

function parseName(subject: string): string {
  // Strip emojis and clean up
  const clean = subject.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').trim();

  // Patterns: "Name | Ferie", "Name (ønsker) ferie...", "Name Ferie", "Ferie Name", "Name ferie"
  const patterns = [
    /^([^|]+)\s*\|\s*ferie/i,           // "Nellemose | Ferie"
    /^(\w+)\s*\(.*?\)\s*ferie/i,        // "Mikkel (ønsker) ferie"
    /^(\w+)\s+ferie/i,                  // "Jesper Ferie" / "DFN ferie"
    /^ferie\s+(\w+)/i,                  // "Ferie Katrine" / "Ferie Betina"
  ];

  for (const pat of patterns) {
    const m = clean.match(pat);
    if (m) return m[1].trim();
  }
  return clean;
}

export async function GET() {
  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 503 });
  }

  try {
    const token = await getAccessToken();

    const today = new Date().toISOString();
    // Fetch up to 12 weeks ahead
    const until = new Date(Date.now() + 84 * 24 * 60 * 60 * 1000).toISOString();

    let allEvents: object[] = [];
    let url: string | null =
      `https://graph.microsoft.com/v1.0/groups/${GROUP_ID}/calendar/events` +
      `?$select=subject,start,end` +
      `&$filter=end/dateTime ge '${today}' and start/dateTime le '${until}'` +
      `&$top=50&$orderby=start/dateTime`;

    while (url) {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 300 }, // cache 5 min
      });
      const data = await res.json();
      allEvents = allEvents.concat(data.value ?? []);
      url = data['@odata.nextLink'] ?? null;
    }

    const events = (allEvents as { subject: string; start: { dateTime: string }; end: { dateTime: string } }[])
      .map(e => ({
        name:  parseName(e.subject),
        raw:   e.subject,
        start: e.start.dateTime.slice(0, 10),
        end:   e.end.dateTime.slice(0, 10),
      }));

    return NextResponse.json({ events });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
