import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="w-full h-20 flex items-center justify-between px-6">
      <Logo />

      <nav className="flex items-center gap-3 text-[1.1rem]">
        <Link
          to="/login"
          className="hover:underline transition"
        >
          Enter
        </Link>

        <span className="text-gray-400">|</span>

        <Link
          to="/signup"
          className="hover:underline transition"
        >
          Register
        </Link>
      </nav>
    </header>
  );
}
