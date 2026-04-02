import Image from "next/image";
import Link from "next/link";

export default function BrandAnchor() {
  return (
    <Link href="/" className="on-brand-anchor" aria-label="OpenNest home">
      <div className="on-brand-anchor-logoWrap">
        <Image
          src="/branding/opennest-logo.png"
          alt="OpenNest"
          width={54}
          height={54}
          className="on-brand-anchor-logo"
          priority
        />
      </div>

      <div>
        <div className="on-brand-anchor-name">
          <span className="on-brand-anchor-open">Open</span>
          <span className="on-brand-anchor-nest">Nest</span>
        </div>
        <div className="on-brand-anchor-tagline">A shared family space</div>
      </div>
    </Link>
  );
}