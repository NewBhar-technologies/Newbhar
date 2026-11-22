import Link from "next/link";

export const CLIENT_PROJECTS = [
  {
    slug: "shopping-platform",
    title: "Shopping Platform",
    tag: "Web Application",
    summary:
      "A full-stack e-commerce platform that enables users to browse products, manage their cart, place orders, and complete secure online payments through a seamless shopping experience.",
    challenge:
      "The goal was to build a modern e-commerce platform that could handle product discovery, cart management, order processing, secure payments, and administrative operations while maintaining a responsive and user-friendly experience across devices.",
    solution:
      "We designed and developed a complete e-commerce web application with product browsing, search and filtering, cart and checkout functionality, Stripe payment integration, order management, and dedicated dashboards for managing products, users, and orders.",
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
    images: ["/client_work_images/shop.png"],
  },
  {
    slug: "analyz-ai",
    title: "Analyz-AI",
    tag: "AI / ML Application",
    summary:
      "An adaptive data science AI assistant that automates EDA, preprocessing, and model benchmarking across 12+ ML algorithms on uploaded CSV datasets.",
    challenge:
      "Manual exploratory data analysis, feature preprocessing, and testing multiple machine learning algorithms on raw CSV datasets is repetitive, time-consuming, and error-prone.",
    solution:
      "Built an end-to-end automated ML pipeline using Python, Flask, and React.js that handles missing-value imputation, encoding, and scaling, auto-detects problem types (classification, regression, clustering), and recommends models with confidence scoring.",
    results: [
      "Trains and benchmarks 12+ models across classification, regression, and clustering pipelines",
      "Auto-selects top-performing models by accuracy/F1 (achieving 88.5% accuracy and 90% F1 on churn data)",
      "Generates feature importance, confusion matrices, and downloadable analysis reports",
      "Automated problem-type detection with confidence-based model recommendations",
    ],
    stack: ["Python", "Flask", "React.js", "Scikit-learn", "XGBoost"],
    cover: "/client_work_images/analyzai.png",
    images: ["/client_work_images/analyzai.png"],
  },
  {
    slug: "cleancity",
    title: "CleanCity",
    tag: "Web Application",
    summary:
      "A civic engagement web application promoting urban cleanliness, sustainability initiatives, and community-driven clean-up volunteering.",
    challenge:
      "Local communities lacked a unified platform to discover neighborhood clean-up drives, register as volunteers, and track ongoing sustainability initiatives effectively.",
    solution:
      "We built a responsive full-stack web platform featuring an interactive drive directory, seamless volunteer registration workflows, automated event reminders, and an admin dashboard to manage campaigns and civic awareness resources.",
    results: [
      "Streamlined online volunteer sign-ups for clean-up events",
      "Centralized hub for city cleanliness & sustainability drives",
      "Real-time event capacity and participation tracking",
      "Responsive, accessible UI driving higher civic engagement",
    ],
    stack: [
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Node.js",
      "Express.js",
      "MongoDB",
    ],
    cover: "/client_work_images/cleancity.png",
    images: ["/client_work_images/cleancity.png"],
  },
  {
    slug: "collabflow",
    title: "CollabFlow",
    tag: "Web Application",
    summary:
      "A full-stack project management platform inspired by Linear, Trello, Jira, and Slack that helps teams manage tasks, collaborate in real time, organize sprints, track deadlines, and analyze project performance.",
    challenge:
      "Modern development teams often struggle with fragmented workflows across separate task boards, chat tools, and sprint trackers, leading to delayed updates and poor visibility into team workloads.",
    solution:
      "We built an all-in-one collaborative workspace featuring live Socket.IO synchronization, drag-and-drop Kanban boards, integrated project chat, role-based access control, sprint calendars, and interactive performance analytics.",
    results: [
      "Real-time Kanban task management with Socket.IO live sync and drag-and-drop",
      "Granular Role-Based Access Control (Admin, Project Manager, Team Member, Viewer)",
      "Integrated project chat with typing indicators, online presence, and instant notifications",
      "Sprint tracking, calendar milestones, global search, and CSV analytics exports",
      "Secure file attachments with JWT authentication and persistent Dark/Light themes",
    ],
    stack: [
      "React 18",
      "Vite 6",
      "Tailwind CSS",
      "Node.js",
      "Express.js",
      "Socket.IO",
      "MongoDB",
      "Mongoose",
      "JWT",
      "Recharts",
    ],
    cover: "/client_work_images/collabflow.png",
    images: ["/client_work_images/collabflow.png"],
  },
];

export default function ClientWorkGrid() {
  return (
    <div className="client-work-grid grid gap-6 sm:grid-cols-2">
      {CLIENT_PROJECTS.map((p) => (
        <Link
          key={p.slug}
          href={`/client-work/${p.slug}`}
          className="client-work-card group"
        >
          <div className="client-work-image relative aspect-video w-full overflow-hidden rounded-xl">
            <img
              src={p.cover}
              alt={p.title}
              loading="lazy"
              className="h-full w-full object-contain"
            />
          </div>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.08em] text-muted">
            {p.tag}
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
            {p.title}
          </h3>
          <p className="mt-1 text-sm text-muted">{p.summary}</p>
        </Link>
      ))}
    </div>
  );
}
