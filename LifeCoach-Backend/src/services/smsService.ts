import Twilio from "twilio";

const client = Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const sendSms = async (to: string, message: string) => {
  return client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
    body: message,
  });
};
