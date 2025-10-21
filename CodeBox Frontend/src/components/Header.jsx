import Logo from "./Logo";

export default function Header() {
  return (
    <div className="w-full h-20 flex  flex-row justify-between">
      <Logo />
      <div className="flex items-end pb-4">
        <p className="text-[1.4rem]"><a href="">Enter</a> | <a href="">Register</a></p>
      </div>
    </div>
  );
}
