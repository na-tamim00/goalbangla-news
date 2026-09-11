export interface SendVerificationCodeParams {
  to: string;
  code: string;
  recipientName: string;
}

export interface EmailService {
  sendVerificationCode(params: SendVerificationCodeParams): Promise<{ success: boolean; error?: string; devCode?: string }>;
  isConfigured(): boolean;
  getLastDevCode(email: string): string | null;
}
