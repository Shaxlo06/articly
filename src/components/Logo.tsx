import Image from "next/image";

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <Image src="/logo.svg" alt="Smart Article" width={28} height={28} priority />
      <span className="font-serif text-lg font-semibold">Smart Article</span>
    </span>
  );
}
