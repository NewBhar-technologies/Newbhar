import Link from "next/link";

export default function Logo({ className = "" }) {
  return (
    <Link href="/" className={`vx-logo ${className}`} aria-label="Newbhar Technologies home">
      <span className="vx-logo-mark" aria-hidden="true">
        <img src="/newbhar-mark.png" alt="Newbhar Technologies Logo" width="38" height="38" />
      </span>
      <span className="vx-logo-text">
        <span className="vx-logo-word">New<span className="vx-logo-accent">bhar</span></span>
        <span className="vx-logo-tag">TECHNOLOGIES</span>
      </span>
    </Link>
  );
}
