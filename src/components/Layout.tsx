
import React, { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export const Layout = ({ children, title }: LayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Navbar title={title} />
        <div className="flex-1 overflow-auto w-full">
          {children}
        </div>
      </div>
    </div>
  );
};
