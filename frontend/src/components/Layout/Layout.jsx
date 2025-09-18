import Navbar from "./Navbar";
import Footer from "./Footer";
import AnnouncementBar from "../Layout/AnnouncementBar";

export default function Layout({ children }) {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="container">{children}</main>
      <Footer />
    </>
  );
}
