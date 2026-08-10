// Mock email sender — logs emails to the console.
// Swap this out for a real provider (e.g. Resend) later.
export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  console.log("=== MOCK EMAIL ===");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(text);
  console.log("==================");
}
