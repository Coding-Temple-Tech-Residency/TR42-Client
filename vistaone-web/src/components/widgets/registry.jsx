import InvoiceOutstandingKpiWidget from "./types/InvoiceOutstandingKpiWidget";
import InvoicesPendingWidget from "./types/InvoicesPendingWidget";
import InvoicesRecentWidget from "./types/InvoicesRecentWidget";
import WorkOrdersRecentWidget from "./types/WorkOrdersRecentWidget";
import WorkOrdersByStatusWidget from "./types/WorkOrdersByStatusWidget";
import VendorsFavoritesWidget from "./types/VendorsFavoritesWidget";
import MsasExpiringWidget from "./types/MsasExpiringWidget";
import WellsRecentWidget from "./types/WellsRecentWidget";
import QuickActionsWidget from "./types/QuickActionsWidget";

export const WIDGET_SIZES = ["small", "medium", "large"];

export const WIDGET_REGISTRY = {
    "invoice-outstanding-kpi": {
        name: "Outstanding Invoices",
        description: "Total dollars awaiting payment",
        category: "Invoices",
        defaultSize: "small",
        Component: InvoiceOutstandingKpiWidget,
    },
    "invoices-pending": {
        name: "Invoices Pending Approval",
        description: "Invoices awaiting your review",
        category: "Invoices",
        defaultSize: "medium",
        Component: InvoicesPendingWidget,
    },
    "invoices-recent": {
        name: "Recent Invoices",
        description: "Latest invoice activity",
        category: "Invoices",
        defaultSize: "medium",
        Component: InvoicesRecentWidget,
    },
    "workorders-recent": {
        name: "Recent Work Orders",
        description: "Latest work orders created",
        category: "Work Orders",
        defaultSize: "medium",
        Component: WorkOrdersRecentWidget,
    },
    "workorders-by-status": {
        name: "Work Orders by Status",
        description: "Status breakdown of your work orders",
        category: "Work Orders",
        defaultSize: "small",
        Component: WorkOrdersByStatusWidget,
    },
    "vendors-favorites": {
        name: "Favorite Vendors",
        description: "Quick access to your saved vendors",
        category: "Vendors",
        defaultSize: "small",
        Component: VendorsFavoritesWidget,
    },
    "msas-expiring": {
        name: "MSAs Expiring Soon",
        description: "Contracts approaching expiration",
        category: "Contracts",
        defaultSize: "medium",
        Component: MsasExpiringWidget,
    },
    "wells-recent": {
        name: "Recent Wells",
        description: "Latest wells added to your portfolio",
        category: "Wells",
        defaultSize: "medium",
        Component: WellsRecentWidget,
    },
    "quick-actions": {
        name: "Quick Actions",
        description: "Shortcuts to common tasks",
        category: "Shortcuts",
        defaultSize: "small",
        Component: QuickActionsWidget,
    },
};

export const DEFAULT_LAYOUT = [
    { type: "invoice-outstanding-kpi", size: "small" },
    { type: "workorders-by-status", size: "small" },
    { type: "quick-actions", size: "small" },
    { type: "invoices-pending", size: "medium" },
    { type: "workorders-recent", size: "medium" },
    { type: "msas-expiring", size: "medium" },
    { type: "vendors-favorites", size: "small" },
];

export function isKnownWidgetType(type) {
    return Object.prototype.hasOwnProperty.call(WIDGET_REGISTRY, type);
}

export function widgetTypeOptions() {
    return Object.entries(WIDGET_REGISTRY).map(([type, def]) => ({
        type,
        name: def.name,
        description: def.description,
        category: def.category,
    }));
}
