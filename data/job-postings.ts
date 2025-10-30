export type JobType = "Full-Time" | "Part-Time" | "Contract";

export type JobPosting = {
  id: number;
  slug: string;
  title: string;
  company: string;
  description: string;
  location: string;
  jobType: JobType;
  overview: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  aboutCompany: string;
  postedOn: string;
};

export const JOB_POSTINGS: JobPosting[] = [
  {
    id: 1,
    slug: "frontend-engineer",
    title: "Frontend Engineer",
    company: "Skyline Labs",
    description:
      "Join a fast-moving product squad to ship polished React experiences and build reusable UI patterns.",
    location: "Remote (US)",
    jobType: "Full-Time",
    overview:
      "Skyline Labs is scaling the next generation of analytics for product-led teams. As a Frontend Engineer, you will own critical user-facing experiences, collaborate with design on interaction patterns, and ensure our UI performs flawlessly for thousands of users every day.",
    responsibilities: [
      "Own and deliver new product surfaces using React, TypeScript, and Tailwind.",
      "Collaborate with design to implement delightful UI interactions and micro-animations.",
      "Improve performance metrics across core flows with thoughtful profiling and optimization.",
      "Contribute to our shared component library and mentor engineers across the org.",
    ],
    requirements: [
      "4+ years building production React or Next.js applications.",
      "Deep knowledge of TypeScript, component composition, and testing practices.",
      "Experience working with design systems and accessibility best practices.",
      "Comfort collaborating across product, design, and backend engineering.",
    ],
    benefits: [
      "Remote-first team across North American time zones.",
      "Competitive salary with equity in a fast-growing startup.",
      "Comprehensive medical, dental, and vision coverage.",
      "Yearly learning stipend, home office budget, and quarterly team offsites.",
    ],
    aboutCompany:
      "Skyline Labs builds analytics software used by product teams to understand how users engage with their experiences. We’re a distributed company with a focus on sustainable velocity and craftsmanship.",
    postedOn: "Published 2 days ago",
  },
  {
    id: 2,
    slug: "product-designer",
    title: "Product Designer",
    company: "Northwind Collective",
    description:
      "Lead discovery and craft intuitive flows for web and mobile surfaces alongside research and engineering.",
    location: "Seattle, WA",
    jobType: "Full-Time",
    overview:
      "Northwind Collective is refreshing how teams coordinate field operations. As our next Product Designer, you’ll partner with product and research to translate customer insights into elegant, high-utility experiences spanning responsive web apps and native mobile surfaces.",
    responsibilities: [
      "Run design discovery and translate insights into storyboards, flows, and high-fidelity mocks.",
      "Collaborate closely with engineering to ensure visual polish and interaction fidelity.",
      "Maintain and evolve our design system with reusable patterns, components, and documentation.",
      "Participate in user interviews, usability testing, and iterative design reviews.",
    ],
    requirements: [
      "Portfolio showcasing end-to-end product work with shipped outcomes.",
      "Expertise in Figma, prototyping, and delivering developer-ready assets.",
      "Experience working in cross-functional product teams.",
      "Ability to balance brand expression with functional requirements.",
    ],
    benefits: [
      "Hybrid schedule with a downtown Seattle studio.",
      "401(k) with company match, commuter benefits, and generous PTO.",
      "Hardware budget and continuous education stipend.",
      "Inclusive culture with monthly team workshops and volunteer days.",
    ],
    aboutCompany:
      "Northwind Collective builds connected tools for logistics and operations teams. We ship quickly, talk to customers weekly, and take pride in the craft of our product experience.",
    postedOn: "Published 1 week ago",
  },
  {
    id: 3,
    slug: "platform-engineer",
    title: "Platform Engineer",
    company: "TrussWorks",
    description:
      "Strengthen our infrastructure layer, own CI/CD pipelines, and collaborate on reliability initiatives.",
    location: "Berlin, Germany",
    jobType: "Contract",
    overview:
      "TrussWorks powers commerce for modern consumer brands. We are seeking a Platform Engineer to join our core infrastructure pod on a contract basis, focusing on developer tooling, observability improvements, and scalable deployment pipelines.",
    responsibilities: [
      "Design and maintain CI/CD pipelines supporting dozens of weekly deployments.",
      "Instrument services with improved logging, tracing, and metrics visibility.",
      "Collaborate with backend teams to define infrastructure-as-code best practices.",
      "Drive on-call readiness, incident reviews, and resilience initiatives.",
    ],
    requirements: [
      "5+ years working across platform, DevOps, or SRE roles.",
      "Strong knowledge of TypeScript/Node.js services and container orchestration.",
      "Hands-on experience with Terraform, AWS, and CI tools like GitHub Actions.",
      "Comfortable working with global teams and excellent written communication.",
    ],
    benefits: [
      "6-month contract with potential to convert to full-time.",
      "Berlin co-working space with stipend for remote setups.",
      "Flexible hours with a distributed team across CET and GMT.",
      "Access to yearly professional development budget.",
    ],
    aboutCompany:
      "TrussWorks delivers cloud infrastructure and data tooling for direct-to-consumer brands. Our teams partner with clients like Lumi, Meadow, and Atlas to keep mission-critical systems online.",
    postedOn: "Published 5 days ago",
  },
  {
    id: 4,
    slug: "customer-success-manager",
    title: "Customer Success Manager",
    company: "FlowState",
    description:
      "Partner with growth-stage customers to onboard teams, surface insights, and influence the roadmap.",
    location: "Austin, TX",
    jobType: "Part-Time",
    overview:
      "FlowState helps hybrid teams align on projects and ship with confidence. As Customer Success Manager, you will own onboarding, drive product adoption, and become a trusted partner to our expanding customer base.",
    responsibilities: [
      "Manage a portfolio of mid-market accounts and craft tailored success plans.",
      "Lead onboarding sessions, QBRs, and training workshops for customer teams.",
      "Surface product feedback directly to product and engineering partners.",
      "Track leading indicators and proactively mitigate risks to expansion.",
    ],
    requirements: [
      "3+ years in Customer Success or Account Management within B2B SaaS.",
      "History of driving retention and expansion with growth-stage customers.",
      "Comfortable communicating insights and recommendations to executive stakeholders.",
      "Strong facilitation skills and genuine empathy for end-users.",
    ],
    benefits: [
      "Part-time (25 hrs/week) with flexible scheduling.",
      "Hybrid Austin team with twice-monthly in-person collaboration days.",
      "Wellness stipend and paid vacation proportional to hours worked.",
      "Opportunity for expansion to full-time as the team scales.",
    ],
    aboutCompany:
      "FlowState is a venture-backed startup building collaboration software for distributed product teams. We value clear communication, thoughtful iteration, and celebration of wins.",
    postedOn: "Published 1 day ago",
  },
  {
    id: 5,
    slug: "marketing-strategist",
    title: "Marketing Strategist",
    company: "Beacon Media",
    description:
      "Own multi-channel launch plans, collaborate with creative, and measure impact on acquisition metrics.",
    location: "New York, NY",
    jobType: "Contract",
    overview:
      "Beacon Media is an agency helping creative brands launch bigger campaigns. We’re looking for a Marketing Strategist to partner with clients on developing go-to-market plans, manage creative briefs, and optimize performance across channels.",
    responsibilities: [
      "Develop and present integrated campaign strategies across paid, owned, and earned media.",
      "Collaborate with creative directors to brief teams and translate campaign concepts into deliverables.",
      "Analyze performance data to surface insights and optimize spend across channels.",
      "Facilitate client meetings, report on progress, and ensure aligned expectations.",
    ],
    requirements: [
      "5+ years in marketing strategy or campaign planning roles.",
      "Hands-on experience with paid social, email lifecycle, and content marketing.",
      "Ability to synthesize complex data into clear storytelling for clients.",
      "Agency experience working with consumer or lifestyle brands is a plus.",
    ],
    benefits: [
      "Initial 9-month contract with opportunity for extension.",
      "Hybrid schedule with 3 days/wk in our Flatiron studio.",
      "Access to professional development workshops and industry events.",
      "Collaborative team with strong creative partnership.",
    ],
    aboutCompany:
      "Beacon Media supports purpose-driven consumer brands with strategy, creative, and performance marketing. Our teams are multidisciplinary, collaborative, and obsessed with outcomes.",
    postedOn: "Published 3 days ago",
  },
];

export const JOB_TYPES = Array.from(
  new Set(JOB_POSTINGS.map((job) => job.jobType)),
) as JobType[];

export const JOB_LOCATIONS = Array.from(
  new Set(JOB_POSTINGS.map((job) => job.location)),
);

export const getJobBySlug = (slug: string) =>
  JOB_POSTINGS.find((job) => job.slug === slug);
