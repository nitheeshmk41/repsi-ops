import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get("repsi_session")?.value;

  if (!session) {
    redirect("/login");
  } else {
    redirect("/dashboard");
  }
}
