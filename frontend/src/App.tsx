import { Outlet } from "react-router-dom";
import AppSideBar from "./components/SideBar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "./components/ui/sidebar";

export default function App() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <div className="flex min-h-screen w-full">
        {/* SIDEBAR */}
        <AppSideBar />

        {/* ÁREA DE CONTEÚDO */}
        <SidebarInset>
          {/* HEADER — só no mobile */}
          <header className="border-b p-4 flex items-center gap-3 md:hidden">
            <SidebarTrigger />
            <h1 className="font-semibold text-lg">GDASH</h1>
          </header>

          {/* CONTEÚDO PRINCIPAL */}
          <main className="flex-1 p-4 overflow-y-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
