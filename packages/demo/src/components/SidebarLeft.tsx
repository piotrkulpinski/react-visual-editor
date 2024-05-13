import { Sidebar } from "@curiousleaf/design"

export const SidebarLeft = () => {
  return (
    <Sidebar
      className="z-10 gap-0 p-0 pt-12 bg-white shadow-outline divide-y overflow-y-auto overscroll-contain"
      sticky
    >
      <div className="p-4 text-sm/none">Left Sidebar</div>
    </Sidebar>
  )
}
