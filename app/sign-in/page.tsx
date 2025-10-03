import Image from "next/image";
import { SignInForm } from "@/components/auth/sign-in-form";

interface SignInPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function SignInPage({ searchParams }: SignInPageProps) {
  const error = searchParams.error as string;

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "invalid-token":
        return "The magic link is invalid or has expired. Please request a new one.";
      case "missing-token":
        return "The magic link is missing. Please request a new one.";
      case "expired":
        return "The magic link has expired. Please request a new one.";
      default:
        return "An error occurred during sign-in. Please try again.";
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Sign in form */}
      <div className="flex-1 bg-white flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          {/* Error message display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-600">
                {getErrorMessage(error)}
              </div>
            </div>
          )}
          <SignInForm />
        </div>
      </div>

      {/* Right side - Hero image with space from corners */}
      <div className="hidden lg:flex flex-1 relative p-4">
        <div className="relative w-full h-full rounded-2xl overflow-hidden">
          <Image
            src="/assets/auth/login.png"
            alt="Net & Connect - Hub Padel"
            fill
            // className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}
