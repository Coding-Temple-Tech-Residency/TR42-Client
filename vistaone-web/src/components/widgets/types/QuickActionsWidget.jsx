import { Link } from "react-router-dom";

const ACTIONS = [
    { label: "New work order", to: "/workorders", icon: "+" },
    { label: "Upload MSA", to: "/contracts", icon: "↑" },
    { label: "Browse vendors", to: "/vendor-marketplace", icon: "→" },
    { label: "Review invoices", to: "/invoices", icon: "$" },
];

export default function QuickActionsWidget() {
    return (
        <div className="quick-actions">
            {ACTIONS.map((a) => (
                <Link key={a.to + a.label} to={a.to} className="quick-action">
                    <span className="quick-action__icon">{a.icon}</span>
                    <span className="quick-action__label">{a.label}</span>
                </Link>
            ))}
        </div>
    );
}
