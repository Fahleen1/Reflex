import { Paddle, Environment } from "@paddle/paddle-node-sdk";

let paddle: Paddle | null = null;

export function isPaddleConfigured(): boolean {
  return !!(
    process.env.PADDLE_API_KEY &&
    process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN &&
    process.env.NEXT_PUBLIC_PADDLE_PRICE_ID
  );
}

export function getPaddleEnvironment(): "sandbox" | "production" {
  return process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
    ? "production"
    : "sandbox";
}

export function getPaddleClient(): Paddle {
  if (!process.env.PADDLE_API_KEY) {
    throw new Error("PADDLE_API_KEY is not configured");
  }

  if (!paddle) {
    paddle = new Paddle(process.env.PADDLE_API_KEY, {
      environment:
        getPaddleEnvironment() === "production"
          ? Environment.production
          : Environment.sandbox,
    });
  }

  return paddle;
}

export function getPaddlePriceId(): string | null {
  return process.env.NEXT_PUBLIC_PADDLE_PRICE_ID ?? null;
}
