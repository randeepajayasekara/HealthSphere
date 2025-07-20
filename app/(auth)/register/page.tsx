import Image from "next/image";
import { RegisterForm } from "@/app/components/layout/Auth/register-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-1 dark:bg-[url('https://i.postimg.cc/QxH1gDTn/abstract-design-background-2705.jpg')] bg-no-repeat bg-cover">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <Image
              src="https://i.postimg.cc/DwF2fbHb/hashedlogo.png"
              width={640}
              height={320}
              priority
              alt="Healthsphere"
              className="w-36 h-auto select-none"
            />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm md:max-w-md lg:max-w-lg">
            <RegisterForm />
          </div>
        </div>
      </div>
      
    </div>
  );
}
