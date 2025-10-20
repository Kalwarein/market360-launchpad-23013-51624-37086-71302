import { useEffect, useState } from "react";

const stats = [
  { label: "Active Users", target: 500, suffix: "+" },
  { label: "Registered Stores", target: 100, suffix: "+" },
  { label: "Jobs Posted", target: 1000, suffix: "+" },
  { label: "Success Rate", target: 98, suffix: "%" },
];

const Stats = () => {
  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const timers = stats.map((stat, index) => {
      const increment = stat.target / steps;
      let current = 0;

      return setInterval(() => {
        current += increment;
        if (current >= stat.target) {
          setCounts((prev) => {
            const newCounts = [...prev];
            newCounts[index] = stat.target;
            return newCounts;
          });
          clearInterval(timers[index]);
        } else {
          setCounts((prev) => {
            const newCounts = [...prev];
            newCounts[index] = Math.floor(current);
            return newCounts;
          });
        }
      }, interval);
    });

    return () => timers.forEach(clearInterval);
  }, []);

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary to-secondary text-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Our Growing Impact
          </h2>
          <p className="text-xl opacity-90">
            Building Sierra Leone's digital future together
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl md:text-6xl font-bold mb-2">
                {counts[index]}{stat.suffix}
              </div>
              <div className="text-lg md:text-xl opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
