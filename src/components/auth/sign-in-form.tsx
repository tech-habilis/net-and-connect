"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { signInSchema, type SignInFormData } from "@/lib/schemas/auth.schema";
import { signInAction } from "@/actions/auth.actions";

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const result = await signInAction(data);

      if (result.success) {
        setSuccess(result.message);
        form.reset(); // Clear the form
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setError("Failed to send magic link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Email input container */}
      <div
        className="w-full mb-6 backdrop-blur-sm p-4 md:p-6 lg:p-8 rounded-2xl border border-gray-600/50 md:px-6 md:py-8 lg:px-9 lg:py-12 lg:min-w-[470px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(23, 23, 23, 0.5) 0%, rgba(23, 23, 23, 0.7) 19%, rgba(23, 23, 23, 1) 52%, rgba(23, 23, 23, 0.7) 78%, rgba(23, 23, 23, 0.5) 100%)",
        }}
      >
        <div className="relative mb-3">
          <input
            {...form.register("email")}
            type="email"
            className="w-full px-4 py-3 md:py-4 bg-black/40 border-2 border-white/60 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-white transition-all duration-200 text-sm md:text-base"
            placeholder="email"
            id="email"
          />
          <label
            htmlFor="email"
            className="absolute left-4 -top-3 bg-[#171717] rounded-md px-2 text-white text-xs md:text-sm font-medium tracking-wide"
          >
            EMAIL*
          </label>
        </div>

        {/* Form validation error */}
        {form.formState.errors.email && (
          <p className="text-red-400 text-xs mt-2 px-1">
            {form.formState.errors.email.message}
          </p>
        )}

        {/* Success message */}
        {success && (
          <div className="text-sm text-green-600 text-center bg-green-50 p-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Sign in button */}
        <button
          type="button"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Trigger form validation
            const isValid = await form.trigger();
            if (!isValid) {
              return;
            }

            const data = form.getValues();
            await onSubmit(data);
          }}
          disabled={isLoading}
          className="w-full cursor-pointer bg-[#DDFF80] hover:bg-[#D4F573] text-black font-bold py-3 md:py-4 px-6 rounded-md transition-all duration-200 flex items-center justify-center text-xs md:text-lg tracking-wide mt-8 md:mt-12 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "ENVOI EN COURS..." : "ENVOYER MON LIEN DE CONNEXION"}
        </button>
      </div>
    </div>
  );
}
