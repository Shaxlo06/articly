import Image from "next/image";

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden bg-accent shrink-0">
        <Image src="/logo.svg" alt="ArticlyApp" width={40} height={40} priority />
      </span>
      <span className="font-serif text-lg font-semibold">ArticlyApp</span>
    </span>
  );
}
