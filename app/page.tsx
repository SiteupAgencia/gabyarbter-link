import { redirect } from "next/navigation";

// Por enquanto, o "/" redireciona pra /bio-insta (a página principal).
// Quando rolar um site mais completo na raiz, é só substituir este arquivo.
export default function Home() {
  redirect("/bio-insta");
}
