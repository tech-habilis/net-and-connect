import Image from "next/image";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SignInPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function SignInPage({ searchParams }: SignInPageProps) {
  const error = searchParams.error as string;

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "invalid-token":
        return "Le lien magique est invalide ou a expire. Veuillez en demander un nouveau.";
      case "missing-token":
        return "Le lien magique est manquant. Veuillez en demander un nouveau.";
      case "expired":
        return "Le lien magique a expire. Veuillez en demander un nouveau.";
      case "user-creation-failed":
        return "Echec de la creation du compte utilisateur. Veuillez reessayer.";
      default:
        return "Une erreur s'est produite lors de la connexion. Veuillez reessayer.";
    }
  };

  return (
    <div
      className="min-h-screen relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/assets/auth/login-bg-min.png)" }}
    >
      {/* Complex gradient overlay with yellow tint on top */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0.9) 100%),
            linear-gradient(to bottom, rgba(255,255,0,0.08) 0%, rgba(255,255,0,0.03) 15%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.85) 100%)
          `,
        }}
      ></div>

      {/* Content container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header with logo */}
        <div className="flex justify-center pt-4 md:pt-8 mb-4 md:mb-10 px-4">
          <Image
            src="/assets/logo.png"
            alt="NET&CONNECT Logo"
            width={200}
            height={50}
            className="object-contain w-40 h-auto md:w-52"
            unoptimized
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 max-w-sm md:max-w-md lg:max-w-lg mx-auto w-full">
          {/* Title */}
          <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 md:mb-9 leading-tight tracking-wide">
            CONNECTEZ-VOUS
          </h1>

          {/* Error message display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg w-full backdrop-blur-sm">
              <div className="text-sm text-red-200">
                {getErrorMessage(error)}
              </div>
            </div>
          )}

          <SignInForm />

          {/* Watermark directly below form on mobile only */}
          <div className="mt-6 -mx-4 flex justify-center md:hidden">
            <Image
              src="/assets/auth/login-watermark.png"
              alt="NET&CONNECT Watermark"
              width={800}
              height={140}
              className="object-contain w-screen max-w-none h-auto px-4"
              unoptimized
            />
          </div>

          {/* Moving catwalks watermark - mobile only */}
          <div className="overflow-hidden w-3/4 mx-auto mt-6 relative md:hidden">
            <div className="flex animate-marquee">
              {[...Array(14)].map((_, index) => (
                <Image
                  key={index}
                  src="/assets/catwalks.png"
                  alt="Catwalks"
                  width={60}
                  height={30}
                  className="object-contain flex-shrink-0 mx-2 opacity-70"
                  unoptimized
                />
              ))}
            </div>
          </div>
        </div>

        {/* Watermark section - for desktop only */}
        <div className="hidden md:flex justify-center px-4 mb-8">
          <Image
            src="/assets/auth/login-watermark.png"
            alt="NET&CONNECT Watermark"
            width={800}
            height={140}
            className="object-contain w-full max-w-xs md:max-w-md lg:max-w-2xl h-auto"
            unoptimized
          />
        </div>

        {/* Moving catwalks watermark - desktop only */}
        <div className="hidden md:block overflow-hidden w-1/2 mx-auto mb-18 md:mb-36 relative">
          <div className="flex animate-marquee">
            {[...Array(14)].map((_, index) => (
              <Image
                key={index}
                src="/assets/catwalks.png"
                alt="Catwalks"
                width={120}
                height={60}
                className="object-contain flex-shrink-0 mx-4 opacity-70"
                unoptimized
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
