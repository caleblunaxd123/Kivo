import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { groupId } = await req.json();
    if (!groupId) {
      return new Response(JSON.stringify({ error: 'groupId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch group data
    const [
      { data: group },
      { data: entries },
      { data: members },
    ] = await Promise.all([
      supabase.from('groups').select('*').eq('id', groupId).single(),
      supabase.from('entries').select('*').eq('group_id', groupId).neq('status', 'archived').order('entry_date'),
      supabase.from('group_members').select('*, user:users(display_name)').eq('group_id', groupId).eq('status', 'active'),
    ]);

    if (!group) {
      return new Response(JSON.stringify({ error: 'Group not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build CSV (Excel-compatible) — ExcelJS not available in Deno edge runtime
    // In production, use a proper xlsx library or generate on client
    const memberMap: Record<string, string> = {};
    for (const m of members ?? []) {
      memberMap[m.user_id] = m.display_name ?? m.user?.display_name ?? 'Unknown';
    }

    const headers = ['#', 'Fecha', 'Descripción', 'Categoría', 'Pagó', 'Monto', 'Moneda', 'Estado'];
    const rows = (entries ?? []).map((e: Record<string, unknown>, i: number) => [
      i + 1,
      e.entry_date,
      e.description,
      e.category,
      memberMap[e.paid_by as string] ?? '—',
      e.amount,
      e.currency,
      e.status,
    ]);

    const csv = [
      `# Vozpe Export — ${group.name}`,
      `# Exportado: ${new Date().toISOString()}`,
      '',
      headers.join(','),
      ...rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return new Response(csv, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="vozpe-${group.name}-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error('export-excel error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
