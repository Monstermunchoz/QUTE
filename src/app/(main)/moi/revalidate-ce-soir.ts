"use server";

import { revalidatePath } from "next/cache";

export async function revalidateCeSoir() {
  revalidatePath("/accueil");
  revalidatePath("/explorer");
  revalidatePath("/moi");
}
