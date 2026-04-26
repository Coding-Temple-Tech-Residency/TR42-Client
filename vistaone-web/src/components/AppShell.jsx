import TopBar from "./TopBar";
import "../styles/appShell.css";
import SideBar from "./SideBar";
import LoadingOverlay from "./LoadingOverlay";
import { useAuthContext } from "../context/AuthContext";
import { sidebarNav } from "../data/dashboardData";

function AppShell({
    title,
    subtitle,
    eyebrow = "Welcome back",
    controls,
    children,
    loading = false,
    loadingText = "Loading...",
}) {
    const { isMaster, isAdmin, user } = useAuthContext();

    const adminSection = [];
    if (isAdmin) {
        adminSection.push({
            to: "/admin/users",
            label: "User Management",
            icon: "users",
        });
    }
    if (isMaster) {
        adminSection.push({
            to: "/admin/roles",
            label: "Role Management",
            icon: "shield",
        });
        adminSection.push({
            to: "/settings",
            label: "Company Settings",
            icon: "settings",
        });
    }

    const navData = {
        ...sidebarNav,
        admin: adminSection,
        userName: user ? `${user.first_name} ${user.last_name}` : "User",
        userRole: user?.roles?.[0] ?? "",
    };

    return (
        <div className="app-shell-page">
            <div className="app-shell-layout">
                <SideBar navData={navData} />

                <section className="app-shell-main">
                    <TopBar
                        title={title}
                        subtitle={subtitle}
                        eyebrow={eyebrow}
                        controls={controls}
                    />
                    <div
                        className="app-shell-content"
                        style={{ position: "relative" }}
                    >
                        <LoadingOverlay show={loading} text={loadingText} />
                        {children}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default AppShell;
