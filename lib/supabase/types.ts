export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "paused";

export type CallStatus =
  | "no-answer"
  | "completed"
  | "busy"
  | "failed"
  | "canceled";

export type ConversationStatus = "open" | "closed" | "spam";

export type CallerIdMode = "passthrough" | "anonymous" | "unknown";

export type Market = "us" | "pk";

export interface BusinessHoursDay {
  open: string;
  close: string;
  closed?: boolean;
}

export type BusinessHours = Record<
  "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
  BusinessHoursDay
>;

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          owner_user_id: string;
          name: string;
          industry: string | null;
          twilio_number: string | null;
          forwarding_number: string | null;
          caller_id_mode: CallerIdMode;
          timezone: string;
          business_hours: Json | null;
          message_template: string;
          trial_ends_at: string | null;
          subscription_status: SubscriptionStatus;
          paddle_customer_id: string | null;
          paddle_subscription_id: string | null;
          market: Market;
          whatsapp_number: string | null;
          missed_call_voice_message: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id: string;
          name: string;
          industry?: string | null;
          twilio_number?: string | null;
          forwarding_number?: string | null;
          caller_id_mode?: CallerIdMode;
          timezone?: string;
          business_hours?: Json | null;
          message_template?: string;
          trial_ends_at?: string | null;
          subscription_status?: SubscriptionStatus;
          paddle_customer_id?: string | null;
          paddle_subscription_id?: string | null;
          market?: Market;
          whatsapp_number?: string | null;
          missed_call_voice_message?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_user_id?: string;
          name?: string;
          industry?: string | null;
          twilio_number?: string | null;
          forwarding_number?: string | null;
          caller_id_mode?: CallerIdMode;
          timezone?: string;
          business_hours?: Json | null;
          message_template?: string;
          trial_ends_at?: string | null;
          subscription_status?: SubscriptionStatus;
          paddle_customer_id?: string | null;
          paddle_subscription_id?: string | null;
          market?: Market;
          whatsapp_number?: string | null;
          missed_call_voice_message?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "businesses_owner_user_id_fkey";
            columns: ["owner_user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      calls: {
        Row: {
          id: string;
          business_id: string;
          conversation_id: string | null;
          caller_number: string | null;
          parent_call_sid: string | null;
          call_sid: string;
          status: CallStatus | null;
          duration_seconds: number | null;
          auto_text_sent: boolean;
          auto_text_skipped_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          conversation_id?: string | null;
          caller_number?: string | null;
          parent_call_sid?: string | null;
          call_sid: string;
          status?: CallStatus | null;
          duration_seconds?: number | null;
          auto_text_sent?: boolean;
          auto_text_skipped_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          conversation_id?: string | null;
          caller_number?: string | null;
          parent_call_sid?: string | null;
          call_sid?: string;
          status?: CallStatus | null;
          duration_seconds?: number | null;
          auto_text_sent?: boolean;
          auto_text_skipped_reason?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "calls_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          id: string;
          business_id: string;
          caller_number: string;
          last_message_at: string | null;
          status: ConversationStatus;
          opted_out: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          caller_number: string;
          last_message_at?: string | null;
          status?: ConversationStatus;
          opted_out?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          caller_number?: string;
          last_message_at?: string | null;
          status?: ConversationStatus;
          opted_out?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          direction: string;
          body: string;
          message_sid: string | null;
          delivery_status: string | null;
          sent_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          direction: string;
          body: string;
          message_sid?: string | null;
          delivery_status?: string | null;
          sent_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          direction?: string;
          body?: string;
          message_sid?: string | null;
          delivery_status?: string | null;
          sent_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      billing_events: {
        Row: {
          id: string;
          business_id: string | null;
          paddle_event_id: string;
          event_type: string | null;
          payload: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id?: string | null;
          paddle_event_id: string;
          event_type?: string | null;
          payload?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string | null;
          paddle_event_id?: string;
          event_type?: string | null;
          payload?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "billing_events_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      subscription_status_enum: SubscriptionStatus;
      call_status_enum: CallStatus;
      conversation_status_enum: ConversationStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Business = Database["public"]["Tables"]["businesses"]["Row"];
export type BusinessInsert =
  Database["public"]["Tables"]["businesses"]["Insert"];
export type BusinessUpdate =
  Database["public"]["Tables"]["businesses"]["Update"];
