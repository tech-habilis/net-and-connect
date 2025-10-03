"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import Image from "next/image";
import { signInSchema, type SignInFormData } from "@/lib/schemas/auth.schema";
import { signInAction } from "@/actions/auth.actions";

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await signInAction(data);
    } catch (error) {
      setError("Failed to send magic link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* User icon */}
      <div className="flex justify-center mb-6">
        <div
          className="w-[50px] h-[50px] border border-[#EDEDED] flex items-center justify-center"
          style={{ borderRadius: "10px" }}
        >
          <Image
            src="/assets/auth/user-square.png"
            alt="User login"
            width={30}
            height={30}
          />
        </div>
      </div>

      {/* Sign in title and description */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Sign in</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Enter your email to continue enjoying a<br />
          seamless experience.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Email field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
            <Input
              {...form.register("email")}
              type="email"
              placeholder="you@example.com"
              className="pl-10 h-12 border-gray-300 focus:border-[#A4D65E] focus:ring-[#A4D65E]"
              style={{ borderRadius: "24px" }}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="text-sm text-red-600 text-center">{error}</div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full h-12 bg-[#C4EF55] hover:bg-[#8BC53E] text-black font-medium text-base"
          style={{ borderRadius: "24px" }}
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Connexion"}
        </Button>
      </form>
    </div>
  );
}
