import { useNavigate } from "react-router-dom";
import { ShieldOff } from "lucide-react";

export default function AccessDenied() {
    const navigate = useNavigate();

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.iconWrap}>
                    <ShieldOff size={48} color="#dc3545" strokeWidth={1.5} />
                </div>
                <h1 style={styles.title}>Access Denied</h1>
                <p style={styles.message}>
                    You don't have permission to view this page.
                    Contact your administrator if you think this is a mistake.
                </p>
                <button style={styles.btn} onClick={() => navigate("/dashboard")}>
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #ffffff, #f8f9fa 52%, #f1f3f5)",
    },
    card: {
        background: "#ffffff",
        border: "1px solid #e9ecef",
        borderRadius: "1rem",
        padding: "3rem 2.5rem",
        maxWidth: "420px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    },
    iconWrap: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "1.25rem",
    },
    title: {
        fontSize: "1.6rem",
        fontWeight: 700,
        color: "#1a1a1a",
        margin: "0 0 0.75rem",
    },
    message: {
        fontSize: "0.95rem",
        color: "#6c757d",
        lineHeight: 1.6,
        margin: "0 0 2rem",
    },
    btn: {
        display: "inline-block",
        padding: "0.7rem 1.75rem",
        background: "#0a1f3b",
        color: "#ffffff",
        border: "none",
        borderRadius: "0.6rem",
        fontSize: "0.95rem",
        fontWeight: 600,
        cursor: "pointer",
    },
};
