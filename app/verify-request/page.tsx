import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-[#A4D65E] rounded-full p-2 mr-3">
              <div className="w-6 h-6 bg-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">NET &</h1>
              <h1 className="text-xl font-bold text-gray-900">CONNECT</h1>
              <p className="text-xs text-gray-500 mt-1">Membres & Événements</p>
            </div>
          </div>
        </div>

        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#A4D65E]/10">
              <Mail className="h-8 w-8 text-[#A4D65E]" />
            </div>
            <CardTitle className="text-2xl font-semibold">
              Check your email
            </CardTitle>
            <CardDescription className="text-gray-600">
              We've sent a magic link to your email address. Click the link to
              sign in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Didn't receive an email? Check your spam folder or try again.
              </p>
              <Link href="/sign-in">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
