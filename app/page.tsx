import Navbar from "./components/navbar/Navbar";
import Hero from "./components/home/Hero";
import Marquee from "./components/home/Marquee";
import NewThisWeek from "./components/home/NewThisWeek";
import Collections from "./components/home/Collections";
import Approach from "./components/home/Approach";
import StaffPicks from "./components/home/StaffPicks";
import Newsletter from "./components/home/Newsletter";
import Footer from "./components/Footer";
import ScrollReveal from "./components/ScrollReveal";

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <Navbar />
      <main className="pt-[52px] md:pt-[56px]">
        <Hero />
        <Marquee />
        <NewThisWeek />
        <Collections />
        <Approach />
        <StaffPicks />
      </main>
      <Newsletter />
      <Footer />
    </>
  );
}
