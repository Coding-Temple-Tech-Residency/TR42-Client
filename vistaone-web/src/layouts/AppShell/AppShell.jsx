import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import TopBar from '../TopBar/TopBar'
import { sidebarNav } from '../../data/sidebarNav'
import '../../styles/AppShell.css'

const AppShell = () => {
    return (
        <div className="app-shell d-flex">
            <Sidebar navData={sidebarNav} />
            <div className="app-shell-main d-flex flex-column">
                <TopBar title="FieldPortal" subtitle="Permian Basin Operations" />
                <div className="app-shell-content">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default AppShell
