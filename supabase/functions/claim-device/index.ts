import { serve } from 'https://deno.land/std@0.178.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

serve(async (req) => {
  try {
    const { device_id, user_id } = await req.json();

    if (!device_id || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing device_id or user_id' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role key for elevated privileges
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    // Update the device with the user_id
    const { data, error } = await supabaseClient
      .from('devices')
      .update({ user_id: user_id })
      .eq('id', device_id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Device not found or already claimed by another user.' }),
        { headers: { 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Device claimed successfully', device: data[0] }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});