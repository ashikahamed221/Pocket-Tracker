import Sidebar from "./Sidebar";

type DashboardLayoutProps = {
    children: React.ReactNode;
};

export default function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    return (
        <div className="flex min-h-screen bg-[#F8F7F2]">
            <Sidebar />

            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}