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
   * Get Supabase UUID for a user by email
   * @param email - User email address
   * @returns User UUID from Supabase
   * @throws Error if user is not found in Supabase
   */
  async getUserSupabaseUuid(email: string): Promise<string> {
    try {
      const { data, error } = await this.supabaseClient
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (error || !data) {
        this.logger.error(
          `User not found in Supabase for email: ${email}`,
          error,
        );
        throw new Error('User not found in Supabase');
      }

      this.logger.log(`Found Supabase UUID for user: ${email}`);
      return data.id;
    } catch (error) {
      this.logger.error(
        `Error fetching Supabase UUID for email: ${email}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Validate that a user has access to a specific obra
   * @param userUuid - Supabase user UUID
   * @param obraId - Obra UUID
   * @returns true if user has access, false otherwise
   */
  async validateUserObraAccess(
    userUuid: string,
    obraId: string,
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseClient
        .from('obra_usuario')
        .select('id')
        .eq('user_id', userUuid)
        .eq('obra_id', obraId)
        .single();

      if (error || !data) {
        this.logger.warn(
          `User ${userUuid} does not have access to obra ${obraId}`,
        );
        return false;
      }

      this.logger.log(`User ${userUuid} has access to obra ${obraId}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error validating obra access for user ${userUuid} and obra ${obraId}`,
        error,
      );
      return false;
    }
  }

  /**
   * Get the Supabase client instance for advanced operations
   */
  getClient(): SupabaseClient {
    return this.supabaseClient;
  }
}
