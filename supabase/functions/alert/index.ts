import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Initialize Supabase client with service role key for elevated access
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { device_id, alert_type, message, sensor_data } = await req.json();

    // 1. Get user ID and email alert preference
    const { data: deviceData, error: deviceError } = await supabase
      .from('devices') // Assuming a 'devices' table exists linking device_id to user_id
      .select('user_id')
      .eq('id', device_id)
      .single();

    if (deviceError || !deviceData) {
      console.error('Error fetching device user_id:', deviceError?.message || 'Device not found');
      // Continue to insert alert even if user data is missing, but log the issue
    }

    let userEmail: string | null = null;
    let emailAlertsEnabled = false;

    if (deviceData?.user_id) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email_alerts_enabled, full_name, id, auth_users(email)')
        .eq('id', deviceData.user_id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      } else if (profileData) {
        emailAlertsEnabled = profileData.email_alerts_enabled;
        userEmail = profileData.auth_users?.email || null;
      }
    }

    // 2. Insert the alert into the 'alerts' table
    const { data, error } = await supabase
      .from('alerts')
      .insert([
        {
          device_id,
          alert_type,
          message,
          sensor_data,
        },
      ]);

    // 3. Send email if enabled
    if (emailAlertsEnabled && userEmail) {
      console.log(`[EMAIL SENT] Alert: ${alert_type} for device ${device_id} to ${userEmail}`);
      // In a real implementation, you would call an email service here (e.g., Resend, SendGrid)
      // Example: await sendEmail({ to: userEmail, subject: 'New Alert', body: message });
    }

    if (error) {

    if (error) {
      console.error('Error inserting alert:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: 'Alert stored successfully', data }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    });
  }
});