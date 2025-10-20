import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, DollarSign } from "lucide-react";

const jobExamples = [
  {
    title: "Web Developer",
    company: "Tech Solutions SL",
    location: "Freetown",
    type: "Full-time",
    salary: "Competitive",
  },
  {
    title: "Marketing Manager",
    company: "Local Business Hub",
    location: "Remote",
    type: "Part-time",
    salary: "Negotiable",
  },
  {
    title: "Graphic Designer",
    company: "Creative Agency",
    location: "Bo",
    type: "Freelance",
    salary: "Per Project",
  },
];

const JobsSection = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Explore Jobs & Freelancers
          </h2>
          <p className="text-xl text-muted-foreground">
            Discover opportunities from remote work to full-time positions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jobExamples.map((job, index) => (
            <Card 
              key={index} 
              className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-secondary/50 cursor-pointer"
            >
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">{job.title}</CardTitle>
                <CardDescription className="font-semibold text-primary">{job.company}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <Badge variant="secondary">{job.type}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>{job.salary}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JobsSection;
