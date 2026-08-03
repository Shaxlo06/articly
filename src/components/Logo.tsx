import Image from "next/image";

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <Image src="/logo.svg" alt="ArticlyApp" width={40} height={40} priority className="shrink-0" />
      <span className="font-serif text-lg font-semibold">ArticlyApp</span>
    </span>
  );
}
