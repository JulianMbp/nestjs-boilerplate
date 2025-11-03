import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import validateConfig from '../utils/validate-config';
import { SupabaseConfig } from './supabase-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  SUPABASE_URL: string;

  @IsString()
  SUPABASE_SERVICE_KEY: string;
}

export default registerAs<SupabaseConfig>('supabase', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    url: process.env.SUPABASE_URL!,
    serviceKey: process.env.SUPABASE_SERVICE_KEY!,
  };
});
