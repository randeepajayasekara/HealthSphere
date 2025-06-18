"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
	e.preventDefault();
	// TODO: Implement actual login logic
	console.log("Login attempt with:", { email, password });
  };

  return (
	<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
	  <div className="w-full max-w-md space-y-8">
		<div>
		  <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
			Sign in to your account
		  </h2>
		  <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
			Or{" "}
			<Link
			  href="/register"
			  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
			>
			  create a new account
			</Link>
		  </p>
		</div>
		<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
		  <div className="-space-y-px rounded-md shadow-sm">
			<div>
			  <label htmlFor="email-address" className="sr-only">
				Email address
			  </label>
			  <input
				id="email-address"
				name="email"
				type="email"
				autoComplete="email"
				required
				className="relative block w-full rounded-t-md border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700 sm:text-sm sm:leading-6"
				placeholder="Email address"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			  />
			</div>
			<div>
			  <label htmlFor="password" className="sr-only">
				Password
			  </label>
			  <input
				id="password"
				name="password"
				type="password"
				autoComplete="current-password"
				required
				className="relative block w-full rounded-b-md border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700 sm:text-sm sm:leading-6"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			  />
			</div>
		  </div>

		  <div className="flex items-center justify-between">
			<div className="flex items-center">
			  <input
				id="remember-me"
				name="remember-me"
				type="checkbox"
				className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
			  />
			  <label
				htmlFor="remember-me"
				className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
			  >
				Remember me
			  </label>
			</div>

			<div className="text-sm">
			  <Link
				href="/forgot-password"
				className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
			  >
				Forgot your password?
			  </Link>
			</div>
		  </div>

		  <div>
			<button
			  type="submit"
			  className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600"
			>
			  Sign in
			</button>
		  </div>
		</form>
	  </div>
	</div>
  );
}
