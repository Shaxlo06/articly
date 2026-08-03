import Image from "next/image";

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span className="flex items-center justify-center w-7 h-7 rounded-full overflow-hidden bg-accent shrink-0">
        <Image src="/logo.svg" alt="Smart Article" width={28} height={28} priority />
      </span>
      <span className="font-serif text-lg font-semibold">Smart Article</span>
    </span>
  );
}
