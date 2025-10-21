export default function Navbar() {
  return (
    <div className="flex flex-row border border-black rounded-2xl mt-1 h-16 px-4">
      <ul className="items-center text-nowrap flex flex-row gap-2 text-[1.2rem]">
        <li>HOME</li>
        <li>PROBLEMSET</li>
        <li>CONSTEST</li>   
      </ul>
    </div>
  );
}
