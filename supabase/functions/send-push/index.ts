import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:hello@fishuponthesky.app';

    if (!vapidPublicKey || !vapidPrivateKey) {
      return new Response(
        JSON.stringify({ error: 'VAPID keys are not configured in Edge Function secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: senderId, error: memberErr } = await userClient.rpc('current_member_id');
    if (memberErr || !senderId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized member.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const title = String(body.title || 'FISH').slice(0, 80);
    const messageBody = String(body.body || '').slice(0, 180);
    const url = String(body.url || '/');
    const tag = String(body.tag || 'fish-update');
    const targetMemberIds: string[] | null = Array.isArray(body.targetMemberIds)
      ? body.targetMemberIds.map(String).filter((id) => id !== senderId)
      : null;

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    let query = adminClient
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth, member_id')
      .neq('member_id', senderId);

    if (targetMemberIds && targetMemberIds.length > 0) {
      query = query.in('member_id', targetMemberIds);
    }

    const { data: subs, error: subErr } = await query;
    if (subErr) throw subErr;

    if (!subs || subs.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const payload = JSON.stringify({ title, body: messageBody, url, tag });
    const staleEndpoints: string[] = [];
    let sent = 0;

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload,
          );
          sent += 1;
        } catch (err: unknown) {
          const status = (err as { statusCode?: number })?.statusCode;
          if (status === 404 || status === 410) {
            staleEndpoints.push(sub.endpoint);
          }
        }
      }),
    );

    if (staleEndpoints.length > 0) {
      await adminClient.from('push_subscriptions').delete().in('endpoint', staleEndpoints);
    }

    return new Response(
      JSON.stringify({ sent, pruned: staleEndpoints.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
