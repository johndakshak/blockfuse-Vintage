import Hero from "./components/home/Hero";
import Marquee from "./components/home/Marquee";
import Navbar from "./components/navbar/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-[72px] md:pt-[76px]">
        <Hero />
        <Marquee />
      </main>
    </>
  );
}