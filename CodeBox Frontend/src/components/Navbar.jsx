import { NavLink } from "react-router-dom";

const navItems = [
  { path: "/", label: "HOME" },
  { path: "/problems", label: "PROBLEMSET" },
  { path: "/contest", label: "CONTEST" },
];

export default function Navbar() {
  return (
    <nav className="flex items-center border border-black rounded-2xl mt-1 h-16 px-4">
      <ul className="flex items-center gap-6 text-[1.2rem]">
        {navItems.map(({ path, label }) => (
          <li key={path}>
            <NavLink
              to={path}
              className={({ isActive }) =>
                isActive
                  ? "font-bold underline"
                  : "hover:underline"
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
