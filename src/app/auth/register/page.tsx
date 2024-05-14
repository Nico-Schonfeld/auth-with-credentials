import { register } from "@/utils/lib";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const RegisterPage = () => {
  return (
    <main className="w-full h-screen">
      <div className="w-full h-full container mx-auto flex items-center justify-center">
        <form
          action={async (formData: FormData) => {
            "use server";

            const res = await register(formData);

            if (res?.error && !res?.success) {
              return;
            }

            if (res?.res && !res.error && res.success) {
              redirect("/");
            }
          }}
          className="flex flex-col items-start gap-10"
        >
          <label htmlFor="name" className="flex items-center gap-5">
            Name:
            <input
              type="name"
              id="name"
              name="name"
              placeholder="Name"
              className="bg-transparent border border-gray-50/50 px-2 py-1 rounded-md"
            />
          </label>

          <label htmlFor="email" className="flex items-center gap-5">
            Email:
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              className="bg-transparent border border-gray-50/50 px-2 py-1 rounded-md"
            />
          </label>

          <label htmlFor="pass" className="flex items-center gap-5">
            Password:
            <input
              type="password"
              id="pass"
              name="pass"
              placeholder="Password"
              className="bg-transparent border border-gray-50/50 px-2 py-1 rounded-md"
            />
          </label>

          <button
            type="submit"
            className="w-full bg-pink-500 rounded-md py-2 hover:bg-pink-600 transition-all font-medium"
          >
            Send
          </button>

          <Link
            href="/"
            type="submit"
            className="w-full text-pink-500 rounded-md py-2  transition-all font-medium flex items-center justify-center"
          >
            Log In
          </Link>
        </form>
      </div>
    </main>
  );
};

export default RegisterPage;
