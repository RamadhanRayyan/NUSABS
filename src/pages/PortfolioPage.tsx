import { motion } from "motion/react";
import { 
  Github, 
  Globe, 
  ExternalLink, 
  Code2, 
  Palette, 
  Terminal,
  Mail,
  Twitter,
  Linkedin
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function PortfolioPage() {
  const projects = [
    {
      title: "NUSA Learning Management System",
      description: "A full-stack LMS built for project-based learning schools.",
      tags: ["Next.js", "Supabase", "Tailwind"],
      image: "https://picsum.photos/seed/lms/600/400"
    },
    {
      title: "Islamic Prayer Times API",
      description: "A high-performance API serving prayer times globally.",
      tags: ["Node.js", "Redis", "Docker"],
      image: "https://picsum.photos/seed/api/600/400"
    },
    {
      title: "DeenTracker Mobile App",
      description: "A habit tracking app for daily ibadah and coding streaks.",
      tags: ["React Native", "Firebase", "Expo"],
      image: "https://picsum.photos/seed/mobile/600/400"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Profile Header */}
      <section className="flex flex-col md:flex-row items-center gap-8 pt-8">
        <Avatar className="h-32 w-32 border-4 border-primary/20">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>RM</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left space-y-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Rayyan Muhammad</h1>
            <p className="text-xl text-muted-foreground">Full Stack Developer & Student at NUSA Boarding School</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Terminal className="w-4 h-4" /> 12 Day Streak
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Code2 className="w-4 h-4" /> 24 Projects
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-4 h-4" /> Grade 11
            </div>
          </div>
          <div className="flex justify-center md:justify-start gap-3">
            <Button size="sm" variant="outline" className="gap-2"><Github className="w-4 h-4" /> GitHub</Button>
            <Button size="sm" variant="outline" className="gap-2"><Linkedin className="w-4 h-4" /> LinkedIn</Button>
            <Button size="sm" className="gap-2"><Mail className="w-4 h-4" /> Contact Me</Button>
          </div>
        </div>
      </section>

      <Separator className="bg-border/40" />

      {/* About Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold">About Me</h2>
          <p className="text-muted-foreground leading-relaxed">
            I'm a passionate developer focused on building tools that combine technology with Islamic values. 
            Currently studying at NUSA Boarding School, I spend my days coding in React and Node.js, 
            while maintaining my daily ibadah and character building. My goal is to become a world-class 
            software engineer who contributes to the Ummah through technology.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Tailwind", "UI/UX", "English"].map(skill => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Projects</h2>
          <Button variant="ghost" className="text-primary">View GitHub <ExternalLink className="ml-2 w-4 h-4" /></Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, idx) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="overflow-hidden group border-border/40 hover:border-primary/40 transition-all h-full flex flex-col">
                <div className="aspect-video overflow-hidden relative">
                  <img src={project.image} alt={project.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button size="icon" variant="secondary" className="rounded-full"><Github className="w-4 h-4" /></Button>
                    <Button size="icon" variant="secondary" className="rounded-full"><ExternalLink className="w-4 h-4" /></Button>
                  </div>
                </div>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
