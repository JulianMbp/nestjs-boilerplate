import { registerAs } from '@nestjs/config';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import validateConfig from '../utils/validate-config';
import { OpenAIConfig } from './openai-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  OPENAI_API_KEY: string;

  @IsString()
  @IsOptional()
  OPENAI_MODEL: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  OPENAI_MAX_TOKENS: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(2)
  OPENAI_TEMPERATURE: number;
}

export default registerAs<OpenAIConfig>('openai', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    maxTokens: process.env.OPENAI_MAX_TOKENS
      ? parseInt(process.env.OPENAI_MAX_TOKENS, 10)
      : 2000,
    temperature: process.env.OPENAI_TEMPERATURE
      ? parseFloat(process.env.OPENAI_TEMPERATURE)
      : 0.7,
  };
});
