import Link from 'next/link';

export function PromoBanner({ text, link, bgColor }: { text: string; link?: string; bgColor?: string }) {
  const content = (
    <div
      className="py-3 text-center text-sm font-semibold text-white"
      style={{ background: bgColor || '#71BC0A' }}
    >
      {text}
    </div>
  );
  return link ? <Link href={link}>{content}</Link> : content;
}
