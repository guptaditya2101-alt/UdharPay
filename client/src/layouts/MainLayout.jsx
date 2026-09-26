import { Outlet } from "react-router-dom";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const MainLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <Nav />

        <main className="page-content">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;