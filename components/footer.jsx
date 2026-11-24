import Link from "next/link";
import { Lock, ArrowUpRight, Github, Linkedin, Twitter, Instagram } from "lucide-react";
import { SITE, SERVICES } from "@/lib/site";
import Logo from "@/components/logo";
import Button from "@/components/ui/button";

export default function Footer() {
	const footerConfig = {
		infoEmail: SITE.infoEmail || "info@newbhar.com",
		contactEmail: SITE.contactEmail || "contact@newbhar.com",
		supportEmail: SITE.supportEmail || "support@newbhar.com",
		meetingUrl: "https://calendly.com/team-newbhar/30min",
		adminLoginLink: {
			label: "Admin Portal",
			url: "/admin/login",
			enabled: true,
			showLockIcon: true,
		},
		brandDescription: "Creative intelligence in every line of code. Custom software, high-conversion web platforms, mobile apps, and enterprise AI engineering.",
	};

	const showAdminLogin = footerConfig.adminLoginLink?.enabled !== false;
	const adminLoginUrl = footerConfig.adminLoginLink?.url || "/admin/login";
	const adminLoginLabel = footerConfig.adminLoginLink?.label || "Admin Portal";
	const showLock = footerConfig.adminLoginLink?.showLockIcon !== false;

	return (
		<footer className="vx-footer">
			<div className="vx-footer-wrap">
				<div className="vx-footer-grid">
					{/* Brand Info */}
					<div className="vx-footer-brand">
						<Logo />
						<p className="mt-4 text-zinc-400 text-sm leading-relaxed">{footerConfig.brandDescription}</p>

						<div className="mt-4 flex items-center gap-3 text-zinc-400">
							<a
								href="https://www.linkedin.com/company/newbhar-technologies/"
								target="_blank"
								rel="noreferrer"
								className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.08] hover:border-[#98f90d] hover:text-[#98f90d] flex items-center justify-center transition-colors"
								aria-label="LinkedIn"
							>
								<Linkedin size={16} />
							</a>
							<a
								href="https://github.com/newbhartechnologies"
								target="_blank"
								rel="noreferrer"
								className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.08] hover:border-[#98f90d] hover:text-[#98f90d] flex items-center justify-center transition-colors"
								aria-label="GitHub"
							>
								<Github size={16} />
							</a>
							{/* <a
								href="https://twitter.com"
								target="_blank"
								rel="noreferrer"
								className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.08] hover:border-[#98f90d] hover:text-[#98f90d] flex items-center justify-center transition-colors"
								aria-label="Twitter / X"
							>
								<Twitter size={16} />
							</a> */}
							<a
								href="https://www.instagram.com/newbhar_technologies/"
								target="_blank"
								rel="noreferrer"
								className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.08] hover:border-[#98f90d] hover:text-[#98f90d] flex items-center justify-center transition-colors"
								aria-label="Instagram"
							>
								<Instagram size={16} />
							</a>
						</div>

						<div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#98f90d]/10 border border-[#98f90d]/20 text-xs font-mono text-[#98f90d] w-fit">
							<span className="w-2 h-2 rounded-full bg-[#98f90d] animate-pulse shadow-[0_0_8px_#98f90d]" />
							<span>All Systems Operational</span>
						</div>
					</div>

					{/* Services */}
					<div>
						<h3>Services</h3>
						<ul>
							{SERVICES.map((service) => (
								<li key={service.slug}>
									<Link href={`/services/${service.slug}`}>{service.title}</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Company */}
					<div>
						<h3>Company</h3>
						<ul>
							{[
								["About Us", "/about"],
								["How We Work", "/how-we-work"],
								["Creative Showcase", "/#creative-showcase"],
								["Technology Stack", "/technologies"],
								["Solutions", "/solutions"],
								["Contact", "/contact"],
							].map(([label, href]) => (
								<li key={href}>
									<Link href={href}>{label}</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Contact & HQ */}
					<div className="vx-footer-contact">
						<h3>Headquarters</h3>
						<p className="text-zinc-400 text-sm leading-relaxed mb-4">
							Kolkata, India · 700109 <br />
							<span className="text-xs text-zinc-500 font-mono">Serving Global Clients</span>
						</p>

						<h3>Get in touch</h3>
						<div className="space-y-2.5 mt-2">
							<div>
								<span className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider">General Enquiries</span>
								<a
									href={`mailto:${footerConfig.infoEmail}?subject=General%20Business%20Enquiry`}
									className="text-[#98f90d] font-mono text-sm hover:underline block transition-colors"
								>
									{footerConfig.infoEmail}
								</a>
							</div>
							<div>
								<span className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Project Enquiries</span>
								<a
									href={`mailto:${footerConfig.contactEmail}?subject=Project%20Enquiry`}
									className="text-[#98f90d] font-mono text-sm hover:underline block transition-colors"
								>
									{footerConfig.contactEmail}
								</a>
							</div>
							<div>
								<span className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Technical Support</span>
								<a
									href={`mailto:${footerConfig.supportEmail}?subject=Technical%20Support%20Request`}
									className="text-[#98f90d] font-mono text-sm hover:underline block transition-colors"
								>
									{footerConfig.supportEmail}
								</a>
							</div>
						</div>

						<div className="mt-5">
							<Button href="/start-project" variant="accent" size="sm">
								Start a Project
							</Button>
						</div>

						{showAdminLogin && (
							<div className="vx-footer-admin-link mt-6">
								<Link href={adminLoginUrl} className="vx-admin-login-link" title="Newbhar Technologies Staff & Admin Portal">
									{showLock && <Lock size={12} aria-hidden="true" />}
									<span>{adminLoginLabel}</span>
								</Link>
							</div>
						)}
					</div>
				</div>

				{/* Footer Tagline & Art */}
				<div className="vx-footer-sign">
					<p className="vx-footer-eyebrow">
						<i />
						{SITE.name} · Innovation Engine
					</p>
					<p className="vx-footer-tagline">
						Creative Intelligence
						<br />
						in Every
						<br />
						<span>Line of Code.</span>
					</p>
				</div>

				{/* Bottom */}
				<div className="vx-footer-bottom">
					<span>
						© {new Date().getFullYear()} {SITE.name}. All rights reserved.
					</span>
					<div>
						<Link href="/privacy-policy">Privacy Policy</Link>
						<Link href="/terms-and-conditions">Terms &amp; Conditions</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
