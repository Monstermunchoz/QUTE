import { createServiceClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";

export function isStripeLiveMode() {
  return (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live_");
}

export function isUsableCustomerId(
  customerId: string | null | undefined,
): customerId is string {
  const id = customerId?.trim() ?? "";

  if (!id.startsWith("cus_")) {
    return false;
  }

  if (id.startsWith("cus_test_") && isStripeLiveMode()) {
    return false;
  }

  return true;
}

function isMissingCustomer(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error ? String(error.code) : "";
  const message = "message" in error ? String(error.message) : "";

  return (
    code === "resource_missing" ||
    message.toLowerCase().includes("no such customer")
  );
}

export async function customerExistsInCurrentMode(customerId: string) {
  try {
    const customer = await getStripe().customers.retrieve(customerId);
    return !("deleted" in customer && customer.deleted);
  } catch (error) {
    if (isMissingCustomer(error)) {
      return false;
    }

    throw error;
  }
}

export async function clearMismatchedCustomer(userId: string) {
  const admin = createServiceClient();
  await admin
    .from("profiles")
    .update({
      stripe_customer_id: null,
      stripe_subscription_id: null,
    })
    .eq("id", userId);
}

export async function resolveStripeCustomer(options: {
  userId: string;
  email?: string | null;
  name?: string | null;
  existingId: string | null;
  createIfMissing: boolean;
}) {
  let customerId = isUsableCustomerId(options.existingId)
    ? options.existingId.trim()
    : null;

  if (options.existingId && !customerId) {
    await clearMismatchedCustomer(options.userId);
  }

  if (customerId) {
    const exists = await customerExistsInCurrentMode(customerId);

    if (!exists) {
      await clearMismatchedCustomer(options.userId);
      customerId = null;
    }
  }

  if (!customerId && options.createIfMissing) {
    const customer = await getStripe().customers.create({
      email: options.email ?? undefined,
      name: options.name ?? undefined,
      metadata: { user_id: options.userId },
    });

    customerId = customer.id;

    const admin = createServiceClient();
    const { error } = await admin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", options.userId);

    if (error) {
      throw new Error(error.message);
    }
  }

  return customerId;
}
