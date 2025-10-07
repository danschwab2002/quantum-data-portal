import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch all active alerts
    const { data: alerts, error: alertsError } = await supabaseClient
      .from('alerts')
      .select('*')
      .eq('is_active', true)

    if (alertsError) {
      throw alertsError
    }

    const triggeredAlerts = []

    for (const alert of alerts || []) {
      try {
        // Execute the query associated with the alert
        const { data: queryResult, error: queryError } = await supabaseClient
          .rpc('execute_sql_query', {
            query_text: alert.query
          })

        if (queryError) {
          console.error(`Error executing query for alert ${alert.id}:`, queryError)
          continue
        }

        // Extract the result value (assuming first row, first column)
        const actualValue = queryResult && queryResult.length > 0 
          ? Object.values(queryResult[0])[0] 
          : 0

        // Check if alert condition is met
        const shouldTrigger = checkAlertCondition(
          actualValue as number,
          alert.threshold_operator,
          alert.threshold_value
        )

        if (shouldTrigger) {
          // Send webhook
          const webhookPayload = {
            alert_id: alert.id,
            alert_name: alert.name,
            threshold_value: alert.threshold_value,
            actual_value: actualValue,
            query_result: queryResult,
            triggered_at: new Date().toISOString(),
            query_name: alert.name
          }

          const webhookResponse = await fetch(alert.webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookPayload),
          })

          // Log the alert trigger
          await supabaseClient
            .from('alert_logs')
            .insert({
              alert_id: alert.id,
              threshold_value: alert.threshold_value,
              actual_value: actualValue as number,
              webhook_response_status: webhookResponse.status,
              webhook_response_body: await webhookResponse.text()
            })

          triggeredAlerts.push({
            alert_id: alert.id,
            alert_name: alert.name,
            actual_value: actualValue,
            webhook_status: webhookResponse.status
          })
        }
      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked_alerts: alerts?.length || 0,
        triggered_alerts: triggeredAlerts.length,
        triggers: triggeredAlerts
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in check-alerts function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

function checkAlertCondition(
  actualValue: number,
  operator: string,
  thresholdValue: number
): boolean {
  switch (operator) {
    case 'less_than':
      return actualValue < thresholdValue
    case 'greater_than':
      return actualValue > thresholdValue
    case 'equal_to':
      return actualValue === thresholdValue
    default:
      return false
  }
}