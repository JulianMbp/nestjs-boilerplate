import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private readonly supabaseClient: SupabaseClient;

  constructor(private configService: ConfigService<AllConfigType>) {
    const supabaseUrl = this.configService.getOrThrow('supabase.url', {
      infer: true,
    });
    const supabaseServiceKey = this.configService.getOrThrow(
      'supabase.serviceKey',
      { infer: true },
    );

    this.supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.logger.log('Supabase client initialized successfully');
  }

  /**
   * Get the Supabase client instance for database operations
   * Use this to interact with Supabase tables and storage
   */
  getClient(): SupabaseClient {
    return this.supabaseClient;
  }
}
