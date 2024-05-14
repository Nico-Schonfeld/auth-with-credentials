import React from "react";
import { getSession, logout } from "@/utils/lib";
import { redirect } from "next/navigation";

const HomePage = async () => {
  const session = await getSession();

  if (!session) return redirect("/");

  return (
    <section className="w-full h-screen">
      <div className="w-full h-full container mx-auto flex flex-col gap-2 items-center justify-center">
        <pre>{JSON.stringify(session, null, 2)}</pre>
        <form
          action={async () => {
            "use server";

            await logout();
            redirect("/");
          }}
        >
          <button
            type="submit"
            className="w-full bg-pink-500 rounded-md px-2 py-2 hover:bg-pink-600 transition-all font-medium"
          >
            Logout
          </button>
        </form>
      </div>
    </section>
  );
};

export default HomePage;
