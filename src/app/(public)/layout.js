import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

/** Marketing/public shell: sticky navbar + footer around every public route. */
export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
