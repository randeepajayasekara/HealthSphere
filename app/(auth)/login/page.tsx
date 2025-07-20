import Image from "next/image"
import { LoginForm } from "@/app/components/layout/Auth/login-form"

export default function LoginPage() {
  return (
    <div className="bg-[url('https://i.postimg.cc/7LPhqMwJ/login-bg.png')] bg-no-repeat bg-cover flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm />
      </div>
    </div>
  )
}
