import Link from 'next/link';
import { Rocket, FileText, Briefcase, TrendingUp, Layers, CheckCircle, BrainCircuit } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="px-6 lg:px-8 h-16 flex items-center justify-between border-b border-border">
        <Link className="flex items-center justify-center space-x-2" href="/">
          <Rocket className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl hidden sm:inline-block">CareerPilot</span>
        </Link>
        <nav className="flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors py-2" href="/login">
            Login
          </Link>
          <Link className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors" href="/register">
            Register
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex justify-center bg-gradient-to-b from-background to-secondary">
          <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Your AI-Powered Career Companion
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Elevate your career with intelligent resume analysis, smart job matching, and tailored placement preparation. Let AI guide your success.
              </p>
            </div>
            <div className="space-x-4">
              <Link className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" href="/register">
                Analyze Resume
              </Link>
              <Link className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" href="/register">
                Match Job
              </Link>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 flex justify-center bg-background">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-center mb-12">Features</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: FileText, title: "Resume Analysis", description: "Get instant, AI-driven feedback on your resume's strengths and areas for improvement." },
                { icon: Briefcase, title: "Job Matching", description: "Find the perfect opportunities tailored to your unique skill set and experience." },
                { icon: TrendingUp, title: "Skill Gap Analysis", description: "Identify what you're missing for your dream job and how to bridge the gap." },
                { icon: Layers, title: "Application Tracker", description: "Keep all your job applications organized in one intuitive dashboard." },
                { icon: CheckCircle, title: "Interview Prep", description: "Practice with AI-generated questions tailored to the specific role you want." },
                { icon: BrainCircuit, title: "AI-Powered Insights", description: "Receive personalized career advice and market trends powered by advanced AI." }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center space-y-2 border border-border p-6 rounded-lg bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 flex justify-center bg-secondary">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Create Profile", description: "Sign up and build your basic professional profile." },
                { step: "2", title: "Upload Resume", description: "Let our AI analyze your current CV for immediate insights." },
                { step: "3", title: "Get Matches", description: "Review AI-curated job opportunities tailored for you." },
                { step: "4", title: "Land the Job", description: "Use our prep tools to ace the interview and get hired." }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 flex justify-center bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Built for Students & New Grads</h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Navigating your early career is tough. CareerPilot provides the guidance, insights, and tools you need to stand out to recruiters and land your first major role.
                </p>
              </div>
              <div className="flex flex-col space-y-4 border border-border p-6 rounded-lg bg-card text-card-foreground shadow-lg">
                <h3 className="text-2xl font-bold text-center">Tech Stack</h3>
                <ul className="grid grid-cols-2 gap-4 text-center font-medium">
                  <li className="bg-secondary p-3 rounded-md">Next.js 15</li>
                  <li className="bg-secondary p-3 rounded-md">TypeScript</li>
                  <li className="bg-secondary p-3 rounded-md">Tailwind CSS</li>
                  <li className="bg-secondary p-3 rounded-md">Prisma</li>
                  <li className="bg-secondary p-3 rounded-md">PostgreSQL</li>
                  <li className="bg-secondary p-3 rounded-md">OpenAI API</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-border">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} CareerPilot. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
