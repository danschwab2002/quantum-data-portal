// Shared types for Smart Alerts functionality
export interface Alert {
  id: string;
  name: string;
  description: string | null;
  question_id: string | null;
  query: string;
  threshold_operator: 'less_than' | 'greater_than' | 'equal_to';
  threshold_value: number;
  webhook_url: string;
  is_active: boolean;
  check_frequency: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface AlertLog {
  id: string;
  alert_id: string;
  triggered_at: string;
  actual_value: number;
  threshold_value: number;
  webhook_response: string | null;
}

export interface Question {
  id: string;
  name: string;
  query: string;
}