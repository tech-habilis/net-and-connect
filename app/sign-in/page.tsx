import Image from "next/image";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Sign in form */}
      <div className="flex-1 bg-white flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
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
