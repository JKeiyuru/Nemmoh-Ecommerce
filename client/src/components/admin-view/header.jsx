import { AlignJustify, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/store/auth-slice";

function AdminHeader({ setOpen }) {
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  return (
    <header className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-background border-b sticky top-0 z-30">
      <Button onClick={() => setOpen(true)} size="icon" variant="ghost" className="lg:hidden">
        <AlignJustify className="w-5 h-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="flex flex-1 justify-end">
        <Button
          onClick={handleLogout}
          size="sm"
          className="inline-flex gap-1.5 sm:gap-2 items-center rounded-md px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-medium shadow"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden xs:inline sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}

export default AdminHeader;
