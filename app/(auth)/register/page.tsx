"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
	e.preventDefault();
	// TODO: Implement actual registration logic
	console.log("Registration attempt with:", { name, email, password });
  };

  return (
	<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
	  <div className="w-full max-w-md space-y-8">
		<div>
		  <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
			Create a new account
		  </h2>
		  <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
			Or{" "}
			<Link
			  href="/login"
			  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
			>
			  sign in to your account
			</Link>
		  </p>
		</div>
		<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
		  <div className="-space-y-px rounded-md shadow-sm">
			<div>
			  <input
				id="name"
				name="name"
				type="text"
				autoComplete="name"
				required
				className="relative block w-full rounded-t-md border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700 sm:text-sm sm:leading-6"
				placeholder="Full name"
				value={name}
				onChange={(e) => setName(e.target.value)}
			  />
			</div>
			<div>
			  <input
				id="email"
				name="email"
				type="email"
				autoComplete="email"
				required
				className="relative block w-full border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700 sm:text-sm sm:leading-6"
				placeholder="Email address"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			  />
			</div>
			<div>
			  <input
				id="password"
				name="password"
				type="password"
				autoComplete="new-password"
				required
				className="relative block w-full border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700 sm:text-sm sm:leading-6"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			  />
			</div>
			<div>
			  <input
				id="confirmPassword"
				name="confirmPassword"
				type="password"
				autoComplete="new-password"
				required
				className="relative block w-full rounded-b-md border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700 sm:text-sm sm:leading-6"
				placeholder="Confirm password"
				value={confirmPassword}
				onChange={(e) => setConfirmPassword(e.target.value)}
			  />
			</div>
		  </div>

		  <div>
			<button
			  type="submit"
			  className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600"
			>
			  Register
			</button>
		  </div>
		</form>
	  </div>
	</div>
  );
}
