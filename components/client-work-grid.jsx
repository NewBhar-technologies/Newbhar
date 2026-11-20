import Link from "next/link";

export const CLIENT_PROJECTS = [
  {
    slug: "shopping-platform",
    title: "Shopping Platform",
    tag: "Web Application",
    summary: "A full-stack e-commerce platform that enables users to browse products, manage their cart, place orders, and complete secure online payments through a seamless shopping experience.",
    challenge: "The goal was to build a modern e-commerce platform that could handle product discovery, cart management, order processing, secure payments, and administrative operations while maintaining a responsive and user-friendly experience across devices.",
    solution: "We designed and developed a complete e-commerce web application with product browsing, search and filtering, cart and checkout functionality, Stripe payment integration, order management, and dedicated dashboards for managing products, users, and orders.",
    results: [
      "Seamless product browsing and shopping experience",
"Secure online payment integration using Stripe",
"Complete cart, checkout, and order management flow",
"Admin dashboard for managing products and orders",
"Responsive interface across desktop, tablet, and mobile devices",
"Scalable full-stack architecture for future expansion",
    ],
    stack: ["React", "Tailwind CSS", "Node.js", "Express.js", "MongoDB"],
    cover: "/client_work_images/shop.png",
    images: [
      "/client_work_images/shop.png",
    ],
  },
  {
    slug: "p2p-platform",
    title: "P2P Platform",
    tag: "Web Application",
    summary: "A peer-to-peer platform connecting users directly for transactions, collaboration and secure communication.",
    challenge: "The client required a secure, user-friendly peer-to-peer platform that facilitates direct interactions between users while maintaining trust, transparency and data security.",
    solution: "We built a robust P2P web application with user authentication, real-time communication features, transaction management and an intuitive interface designed for ease of use.",
    results: [
      "Secure peer-to-peer transaction flow",
      "User-friendly interface with smooth onboarding",
      "Real-time updates and notifications",
      "Scalable platform architecture",
    ],
    stack: ["React", "Node.js", "MongoDB", "Express.js", "Tailwind CSS", "Stripe"],
    cover: "/client_work_images/p2p1.jpg",
    images: ["/client_work_images/p2p1.jpg"],
  },
  {
    slug: "loop-application",
    title: "Loop Application",
    tag: "Web Application",
    summary: "A workflow-driven application designed to streamline recurring business processes and team collaboration.",
    challenge: "The client's team relied on scattered tools and manual follow-ups to manage recurring tasks, leading to missed deadlines and lack of visibility across workflows.",
    solution: "We developed a centralised loop-based application that automates recurring workflows, provides clear task ownership, and gives management real-time visibility into progress.",
    results: [
      "Automated recurring task management",
      "Clear ownership and accountability",
      "Real-time progress tracking",
      "Reduced manual follow-ups",
    ],
    stack: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"],
    cover: "/client_work_images/loop1.jpg",
    images: ["/client_work_images/loop1.jpg"],
  },
  {
    slug: "dr-project",
    title: "DR Project",
    tag: "Web Application",
    summary: "A data-rich web application built to manage, visualise and report on critical business information efficiently.",
    challenge: "The client needed a reliable system to consolidate data from multiple sources, generate actionable reports, and support decision-making with clear visual dashboards.",
    solution: "We built a comprehensive data reporting application with interactive dashboards, automated report generation, and role-based access to ensure the right people see the right information.",
    results: [
      "Consolidated data from multiple sources",
      "Interactive dashboards and visual reports",
      "Role-based access control",
      "Faster and more informed decision-making",
    ],
    stack: ["React", "Python", "Node.js", "PostgreSQL", "REST APIs"],
    cover: "/client_work_images/dr1.jpg",
    images: ["/client_work_images/dr1.jpg"],
  },
];

export default function ClientWorkGrid() {
  return (
    <div className="client-work-grid grid gap-6 sm:grid-cols-2">
      {CLIENT_PROJECTS.map((p) => (
        <Link key={p.slug} href={`/client-work/${p.slug}`} className="client-work-card group">
          <div className="client-work-image relative aspect-video w-full overflow-hidden rounded-xl">
            <img
              src={p.cover}
              alt={p.title}
              loading="lazy"
              className="h-full w-full object-contain"
            />

          </div>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.08em] text-muted">{p.tag}</p>
          <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em]">{p.title}</h3>
          <p className="mt-1 text-sm text-muted">{p.summary}</p>
        </Link>
      ))}
    </div>
  );
}
