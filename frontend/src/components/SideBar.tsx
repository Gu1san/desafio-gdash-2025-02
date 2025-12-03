import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, CloudRain, Settings } from "lucide-react";

export default function Sidebar() {
  const { pathname } = useLocation();

  const menu = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/",
    },
    {
      label: "Usuários",
      icon: <Users size={20} />,
      path: "/users",
    },
    {
      label: "Clima",
      icon: <CloudRain size={20} />,
      path: "/weather",
    },
    {
      label: "Configurações",
      icon: <Settings size={20} />,
      path: "/settings",
    },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r flex flex-col">
      <div className="p-6 font-bold text-xl">GDASH</div>

      <nav className="flex flex-col gap-1 px-3">
        {menu.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl p-3 transition
                ${
                  active
                    ? "bg-gray-200 text-black font-medium"
                    : "hover:bg-gray-100"
                }
              `}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
