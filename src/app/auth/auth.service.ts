import { apiClient } from '@/lib/api-client';
import { USE_MOCK_DATA } from '@/lib/config';
import type { ForgotPasswordDto, ResetPasswordDto } from '@/types/api';

export async function forgotPassword(dto: ForgotPasswordDto): Promise<void> {
  if (USE_MOCK_DATA) return;
  await apiClient.post('/auth/forgot-password', dto);
}

export async function resetPassword(dto: ResetPasswordDto): Promise<void> {
  if (USE_MOCK_DATA) return;
  await apiClient.post('/auth/reset-password', dto);
}
