// import Sidebar from "./Sidebar";

// type DashboardLayoutProps = {
//     children: React.ReactNode;
// };

// export default function DashboardLayout({
//     children,
// }: DashboardLayoutProps) {
//     return (
//         <div className="min-h-screen bg-[#F8F7F2]">
//             <Sidebar />

//             <main className="min-w-0 lg:ml-64">
//                 {children}
//             </main>
//         </div>
//     );
// }


import Sidebar from "./Sidebar";

type DashboardLayoutProps = {
    children: React.ReactNode;
};

export default function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar />

            <main className="min-w-0 lg:ml-64">
                {children}
            </main>
        </div>
    );
}