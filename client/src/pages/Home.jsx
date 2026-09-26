import Hero from "../components/Hero";
import Features from "../components/Features";
import Footer from "../components/Footer";
import Nav from "../components/Nav";

const Home = () => {
  return (
    <div className="home-page">
      <Nav />

      <Hero />

      <Features />

      <Footer />
    </div>
  );
};

export default Home;