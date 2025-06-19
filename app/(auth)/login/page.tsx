import { LoginForm } from "../../components/layout/Auth/login-form";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-[url('https://i.postimg.cc/0NQtJ4cp/hall-bg.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <span className="flex items-center gap-2 self-center font-medium text-black dark:text-white select-none">
          <div className="flex items-center justify-center rounded-md bg-transparent text-black dark:text-white">
            <img
              src="https://i.ibb.co/T9pQJr6/icon.png"
              className="w-8 h-auto select-none"
            />
          </div>
          Streamline Cinemas
        </span>
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
        >
          <LoginForm />
        </motion.div>
      </div>
    </div>
  );
}
