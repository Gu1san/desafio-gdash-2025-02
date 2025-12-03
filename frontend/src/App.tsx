import { Outlet } from "react-router-dom";
import Sidebar from "./components/SideBar";

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
