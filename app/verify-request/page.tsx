import Image from "next/image";

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Verification message */}
      <div className="flex-1 bg-white flex items-center justify-center px-8">
        <div className="w-full max-w-sm text-center">
          {/* Success icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-[50px] h-[50px] border border-[#A4D65E] flex items-center justify-center"
              style={{ borderRadius: "10px" }}
            >
              <svg
                className="w-6 h-6 text-[#A4D65E]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Title and description */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Check your email
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              We've sent you a magic link to sign in.
              <br />
              Please check your email and click the link to continue.
            </p>
          </div>

          {/* Back to sign in link */}
          <div className="text-center">
            <a
              href="/sign-in"
              className="text-[#A4D65E] hover:text-[#8BC53E] text-sm font-medium"
            >
              ← Back to sign in
            </a>
          </div>
        </div>
      </div>

      {/* Right side - Hero image */}
      <div className="hidden lg:flex flex-1 relative p-8">
        <div className="relative w-full h-full rounded-2xl overflow-hidden">
          <Image
            src="/assets/auth/login.png"
            alt="Net & Connect - Hub Padel"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}
