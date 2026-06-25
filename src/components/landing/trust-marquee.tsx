const ITEMS = [
  "Software Engineer",
  "Product Manager",
  "Data Analyst",
  "UX Designer",
  "Marketing Lead",
  "Financial Analyst",
  "Nurse Practitioner",
  "Sales Executive",
  "Operations Manager",
  "Mechanical Engineer",
];

export function TrustMarquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <section className="border-y border-border py-6">
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="marquee gap-10 pr-10">
          {row.map((item, i) => (
            <span
              key={i}
              className="whitespace-nowrap text-sm font-medium text-muted-foreground"
            >
              {item}
              <span className="ml-10 text-border">/</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
