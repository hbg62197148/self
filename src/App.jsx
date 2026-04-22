import { useEffect, useMemo, useState } from "react";
import { profile } from "./data/profile";

const navItems = [
  { id: "home", label: "Home" },
  { id: "identity", label: "Identity" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skill Universe" },
  { id: "projects", label: "Chapters" },
  { id: "contact", label: "Contact" }
];

const sectionMeta = {
  home: {
    index: "01",
    label: "Opening Signal",
    tone: "#ff6a3d",
    glow: "rgba(255, 106, 61, 0.24)",
    glowSoft: "rgba(255, 106, 61, 0.12)"
  },
  identity: {
    index: "02",
    label: "Identity Breakdown",
    tone: "#f6c85f",
    glow: "rgba(246, 200, 95, 0.22)",
    glowSoft: "rgba(246, 200, 95, 0.1)"
  },
  about: {
    index: "03",
    label: "Profile Interior",
    tone: "#7bf7d4",
    glow: "rgba(123, 247, 212, 0.22)",
    glowSoft: "rgba(123, 247, 212, 0.1)"
  },
  skills: {
    index: "04",
    label: "Skill Universe",
    tone: "#9ea9ff",
    glow: "rgba(158, 169, 255, 0.24)",
    glowSoft: "rgba(158, 169, 255, 0.11)"
  },
  projects: {
    index: "05",
    label: "Selected Chapters",
    tone: "#ff8cb7",
    glow: "rgba(255, 140, 183, 0.22)",
    glowSoft: "rgba(255, 140, 183, 0.1)"
  },
  contact: {
    index: "06",
    label: "Contact Finale",
    tone: "#69d2ff",
    glow: "rgba(105, 210, 255, 0.24)",
    glowSoft: "rgba(105, 210, 255, 0.1)"
  }
};

const classNames = (...tokens) => tokens.filter(Boolean).join(" ");

function Staged({ as: Tag = "div", order = 0, className, style, children, ...props }) {
  return (
    <Tag
      className={classNames("stage-item", className)}
      style={{
        ...style,
        "--stage-order": order
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}

function SectionHeading({ issue, title, copy }) {
  return (
    <header className="section-heading">
      <Staged as="div" order={0}>
        <p className="section-kicker">{issue}</p>
        <h2 className="section-title">{title}</h2>
      </Staged>
      <Staged as="p" className="section-copy" order={1}>
        {copy}
      </Staged>
    </header>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(profile.questions[0]);
  const [activeProjectId, setActiveProjectId] = useState(profile.projects.items[0].id);
  const [activeSection, setActiveSection] = useState("home");
  const [copiedLabel, setCopiedLabel] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1300);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading]);

  useEffect(() => {
    const nodes = [...document.querySelectorAll("[data-reveal]")];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const shouldShow = entry.isIntersecting && entry.intersectionRatio >= 0.22;
          const shouldReset = !entry.isIntersecting || entry.intersectionRatio <= 0.08;

          if (shouldShow) {
            entry.target.classList.add("is-visible");
          } else if (shouldReset) {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: [0, 0.08, 0.22, 0.4, 0.6],
        rootMargin: "0px 0px -8% 0px"
      }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sections = [...document.querySelectorAll("section[id]")];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (visible) {
          setActiveSection(visible.target.id);
        }
      },
      {
        threshold: [0.25, 0.45, 0.7]
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handlePointerMove = (event) => {
      document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  const activeProject = useMemo(
    () =>
      profile.projects.items.find((item) => item.id === activeProjectId) ??
      profile.projects.items[0],
    [activeProjectId]
  );
  const activeMeta = sectionMeta[activeSection] ?? sectionMeta.home;
  const identityLetters = profile.deconstruction.cards.map((item) => item.letter).join("");

  const copyToClipboard = async (text, label) => {
    if (!text) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopiedLabel(label ?? "Copied");
      window.setTimeout(() => setCopiedLabel(null), 1200);
    } catch {
      // Ignore copy failures (permissions / unsupported browser).
    }
  };

  return (
    <div
      className="app-shell"
      style={{
        "--active-tone": activeMeta.tone,
        "--active-glow": activeMeta.glow,
        "--active-glow-soft": activeMeta.glowSoft
      }}
    >
      <div className={classNames("loading-screen", !loading && "is-hidden")} aria-hidden={!loading}>
        <div className="loading-stack">
          <span className="loading-label">LOADING</span>
          <strong>{profile.edition}</strong>
          <p>Vite profile issue is assembling...</p>
        </div>
      </div>

      <div className="background-noise" aria-hidden="true" />

      <aside className="chapter-beacon" aria-hidden="true">
        <span>{activeMeta.index}</span>
        <strong>{activeMeta.label}</strong>
      </aside>

      <header className="site-header">
        <a className="brand" href="#home">
          <span className="brand-mark">PI</span>
          <span className="brand-copy">
            <strong>Personal Issue</strong>
            <small>个人专刊</small>
          </span>
        </a>

        <nav className="site-nav" aria-label="页面导航">
          {navItems.map((item) => (
            <a
              key={item.id}
              className={classNames("nav-link", activeSection === item.id && "is-active")}
              href={`#${item.id}`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="page-content">
        <section className="hero panel" id="home" data-reveal>
          <div className="hero-copy">
            <Staged as="p" className="section-kicker" order={0}>
              {profile.hero.issue}
            </Staged>
            <Staged as="p" className="hero-eyebrow" order={1}>
              {profile.hero.eyebrow}
            </Staged>

            <Staged as="h1" className="hero-title" order={2}>
              {profile.hero.title.map((line) => (
                <span key={line} className="hero-line">
                  {line}
                </span>
              ))}
            </Staged>

            <Staged as="p" className="hero-subtitle" order={3}>
              {profile.hero.subtitle}
            </Staged>

            <Staged className="hero-actions" order={4}>
              <a className="button button-primary" href={profile.hero.primaryCta.href}>
                {profile.hero.primaryCta.label}
              </a>
              <a className="button button-secondary" href={profile.hero.secondaryCta.href}>
                {profile.hero.secondaryCta.label}
              </a>
            </Staged>

            <div className="hero-stats">
              {profile.hero.stats.map((item, index) => (
                <Staged as="article" key={item.label} className="stat-card" order={5 + index}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </Staged>
              ))}
            </div>
          </div>

          <div className="hero-stage">
            <Staged className="portrait-shell" order={2}>
              <div className="portrait-card">
                <div className="portrait-glow portrait-glow-one" />
                <div className="portrait-glow portrait-glow-two" />
                <div className="portrait-grid" />
                <div className="portrait-disc" />
                <div className="portrait-plate">
                  <span>{profile.nameCn}</span>
                  <strong>{profile.nameEn}</strong>
                </div>
              </div>
              <div className="floating-pill floating-pill-top">{profile.role}</div>
            </Staged>

            <Staged as="aside" className="hero-sidecard" order={6}>
              <p className="mini-label">Profile Pulse</p>
              <h2>{profile.role}</h2>
              <p className="hero-summary">{profile.hero.summary}</p>

              <div className="tag-strip">
                {profile.hero.tags.map((item) => (
                  <span key={item} className="tag-chip">
                    {item}
                  </span>
                ))}
              </div>
            </Staged>
          </div>
        </section>

        <section className="section panel" id="identity" data-reveal>
          <SectionHeading
            issue={profile.deconstruction.issue}
            title={profile.deconstruction.title}
            copy={profile.deconstruction.copy}
          />

          <div className="identity-shell">
            <div className="name-stack" aria-label={`${identityLetters} breakdown`}>
              <span className="name-ghost" aria-hidden="true">
                {profile.deconstruction.cards.map((item) => (
                  <span key={`ghost-${item.letter}-${item.word}`} className="name-ghost-letter">
                    {item.letter}
                  </span>
                ))}
              </span>

              {profile.deconstruction.cards.map((item, index) => (
                <Staged
                  as="div"
                  key={item.letter + item.word}
                  className="name-row"
                  order={2 + index}
                  style={{
                    "--row-progress": (1 - index / Math.max(profile.deconstruction.cards.length - 1, 1)).toFixed(3)
                  }}
                >
                  <span className="name-letter-shell" tabIndex={0}>
                    <span className="name-letter">{item.letter}</span>
                    <span className="name-letter-overlay" aria-hidden="true">
                      {item.zh}
                    </span>
                  </span>

                  <div className="name-copy">
                    <em>{item.word}</em>
                    <small className="name-translation">{item.zh}</small>
                    <p>{item.text}</p>
                  </div>
                </Staged>
              ))}
            </div>
          </div>
        </section>

        <section className="section panel" id="about" data-reveal>
          <SectionHeading
            issue={profile.about.issue}
            title={profile.about.title}
            copy={profile.about.copy}
          />

          <div className="about-layout">
            <Staged as="article" className="panel-inset about-story" order={2}>
              <Staged className="about-visual stage-subitem" order={0}>
                <span className="mini-label">{profile.about.portraitLabel}</span>
                <div className="about-frame">
                  <div className="about-spider-shell" aria-hidden="true">
                    <img
                      className="about-spider"
                      src="/about-spider.svg"
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="about-frame-core" />
                  <div className="about-frame-outline" />
                  <div className="about-frame-cross" />
                </div>
                <div className="snippet-stack">
                  {profile.about.snippets.map((item) => (
                    <span key={item} className="snippet-chip">
                      {item}
                    </span>
                  ))}
                </div>
              </Staged>

              <div className="story-copy">
                {profile.about.paragraphs.map((paragraph, index) => (
                  <Staged as="p" key={paragraph} className="stage-subitem" order={1 + index}>
                    {paragraph}
                  </Staged>
                ))}
              </div>
            </Staged>

            <Staged as="article" className="panel-inset ask-panel" order={3}>
              <Staged className="ask-panel-head stage-subitem" order={0}>
                <p className="mini-label">Ask The Profile</p>
                <span className="status-pill">Interactive</span>
              </Staged>

              <div key={activeQuestion.id} className="answer-stage stage-subitem stage-swap" style={{ "--stage-order": 1 }}>
                <h3>{activeQuestion.prompt}</h3>
                <p>{activeQuestion.answer}</p>
              </div>

              <div className="question-list">
                {profile.questions.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={classNames(
                      "stage-subitem",
                      "question-button",
                      item.id === activeQuestion.id && "is-active"
                    )}
                    style={{ "--stage-order": 2 + index }}
                    onClick={() => setActiveQuestion(item)}
                  >
                    {item.prompt}
                  </button>
                ))}
              </div>

              <div className="fact-grid">
                {profile.about.quickFacts.map((item, index) => (
                  <Staged as="article" key={item.label} className="fact-card stage-subitem" order={6 + index}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </Staged>
                ))}
              </div>
            </Staged>
          </div>
        </section>

        <section className="section panel" id="skills" data-reveal>
          <SectionHeading
            issue={profile.skills.issue}
            title={profile.skills.title}
            copy={profile.skills.copy}
          />

          <div className="skills-layout">
            <Staged as="article" className="panel-inset universe-stage" order={2}>
              <div className="orbit orbit-outer stage-fade" style={{ "--stage-order": 0 }} />
              <div className="orbit orbit-middle stage-fade" style={{ "--stage-order": 1 }} />
              <div className="orbit orbit-inner stage-fade" style={{ "--stage-order": 2 }} />

              <div className="universe-core stage-subitem" style={{ "--stage-order": 3 }}>
                <span>Core System</span>
                <strong>{profile.skills.core}</strong>
                <p>{profile.skills.coreNote}</p>
              </div>

              {profile.skills.nodes.map((node, index) => (
                <div
                  key={node.label}
                  className="universe-node stage-subitem"
                  style={{
                    "--x": node.label === "Motion" ? "35%" : node.x,
                    "--y": node.y,
                    "--tone": node.tone,
                    "--stage-order": 4 + index
                  }}
                >
                  <span>{node.detail}</span>
                  <strong>{node.label}</strong>
                </div>
              ))}
            </Staged>

            <div className="skills-column">
              {profile.skills.groups.map((group, index) => (
                <Staged as="article" key={group.title} className="skill-card panel-inset" order={3 + index}>
                  <h3>{group.title}</h3>
                  <p>{group.note}</p>
                  <div className="skill-list">
                    {group.items.map((item) => (
                      <span key={item} className="skill-pill">
                        {item}
                      </span>
                    ))}
                  </div>
                </Staged>
              ))}
            </div>
          </div>
        </section>

        <section className="section panel" id="projects" data-reveal>
          <SectionHeading
            issue={profile.projects.issue}
            title={profile.projects.title}
            copy={profile.projects.copy}
          />

          <div className="projects-layout">
            <div className="project-list">
              {profile.projects.items.map((item, index) => (
                <Staged
                  as="button"
                  key={item.id}
                  type="button"
                  className={classNames("project-tab", item.id === activeProjectId && "is-active")}
                  order={2 + index}
                  onClick={() => setActiveProjectId(item.id)}
                >
                  <span className="project-index">{item.index}</span>
                  <div className="project-tab-copy">
                    <small>{item.category}</small>
                    <strong>{item.title}</strong>
                    <p>{item.subtitle}</p>
                  </div>
                </Staged>
              ))}
            </div>

            <article className="project-detail panel-inset stage-item" style={{ "--stage-order": 6 }}>
              <div key={activeProject.id} className="project-detail-swap stage-swap">
              <div className="project-detail-head">
                <div>
                  <p className="mini-label">{activeProject.category}</p>
                  <h3>{activeProject.title}</h3>
                </div>
                <span className="detail-index">{activeProject.index}</span>
              </div>

              <p className="project-description">{activeProject.description}</p>

              <div className="signal-grid">
                {activeProject.signals.map((item) => (
                  <article key={item.label} className="signal-card">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </div>

              <div className="stack-row">
                {activeProject.stack.map((item) => (
                  <span key={item} className="tag-chip">
                    {item}
                  </span>
                ))}
              </div>

              <div className="detail-list">
                {activeProject.details.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
              </div>
            </article>
          </div>
        </section>

        <section className="section panel contact-section" id="contact" data-reveal>
          <SectionHeading
            issue={profile.contact.issue}
            title={profile.contact.title}
            copy={profile.contact.copy}
          />

          <div className="contact-layout">
            <Staged as="article" className="contact-display panel-inset" order={2}>
              <p>{profile.contact.display}</p>
              <span>{profile.contact.intro}</span>
            </Staged>

            <div className="contact-grid">
              {profile.contact.items.map((item, index) => {
                const external = item.href ? /^(https?:|mailto:)/.test(item.href) : false;

                return (
                  <Staged
                    as="article"
                    key={item.label}
                    className="contact-card panel-inset"
                    order={3 + index}
                  >
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                    {item.copy ? (
                      <button
                        type="button"
                        className="contact-action"
                        onClick={() => copyToClipboard(item.value, item.label)}
                      >
                        {copiedLabel === item.label ? "Copied" : item.action}
                      </button>
                    ) : (
                      <a
                        className="contact-action"
                        href={item.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noreferrer" : undefined}
                      >
                        {item.action}
                      </a>
                    )}
                  </Staged>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>Personal Issue | 个人专刊 | Huang Binge</span>
        <span>{new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}

export default App;
