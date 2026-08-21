import { z } from "zod";
import { isAdult } from "@/lib/utils/age";

export const registerSchema = z
  .object({
    email: z.string().email("Email invalide."),
    password: z.string().min(8, "8 caractères minimum."),
    pseudo: z.string().min(3, "3 caractères minimum."),
    dateNaissance: z.string().min(1, "Date de naissance requise."),
    certifieMajeur: z.boolean().refine((value) => value === true, {
      message: "Tu dois certifier avoir 18 ans ou plus.",
    }),
    accepteCgu: z.boolean().refine((value) => value === true, {
      message: "Tu dois accepter les CGU.",
    }),
  })
  .refine((data) => isAdult(data.dateNaissance), {
    message: "Tu dois avoir 18 ans ou plus.",
    path: ["dateNaissance"],
  });

export const loginSchema = z.object({
  email: z.string().email("Email invalide."),
  password: z.string().min(1, "Mot de passe requis."),
});

export type RegisterValues = z.infer<typeof registerSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
