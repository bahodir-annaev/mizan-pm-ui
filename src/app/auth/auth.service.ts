import { apiClient } from '@/lib/api-client';
import type { ForgotPasswordDto, ResetPasswordDto } from '@/types/api';

export async function forgotPassword(dto: ForgotPasswordDto): Promise<void> {
  await apiClient.post('/auth/forgot-password', dto);
}

export async function resetPassword(dto: ResetPasswordDto): Promise<void> {
  await apiClient.post('/auth/reset-password', dto);
}
