const NAV_ACTIVE_CLASS = "is-active";

function createNode(tag, className, text) {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text) {
    node.textContent = text;
  }
  return node;
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = value || "";
  }
}

function renderChipLinks(containerId, links) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  container.innerHTML = "";
  links.forEach((link) => {
    if (!link || !link.href || !link.label) {
      return;
    }
    const anchor = createNode("a");
    anchor.href = link.href;
    anchor.textContent = link.label;
    const isExternal = link.href.startsWith("http");
    if (isExternal) {
      anchor.target = "_blank";
      anchor.rel = "noopener";
    }
    container.appendChild(anchor);
  });
}

function renderResearchFocus(items) {
  const list = document.getElementById("research-focus-list");
  if (!list) {
    return;
  }

  list.innerHTML = "";
  items.forEach((item) => {
    const li = createNode("li", null, item);
    list.appendChild(li);
  });
}

function renderProjects(projects) {
  const grid = document.getElementById("projects-grid");
  if (!grid) {
    return;
  }
  grid.innerHTML = "";

  projects.forEach((project) => {
    const card = createNode("article", "project-card");
    card.appendChild(createNode("p", "eyebrow", project.theme));
    card.appendChild(createNode("h3", null, project.title));
    card.appendChild(
      createNode(
        "p",
        "project-meta",
        [project.period, project.status].filter(Boolean).join(" | ")
      )
    );
    card.appendChild(createNode("p", null, project.summary));

    if (project.methods && project.methods.length > 0) {
      card.appendChild(createNode("p", "eyebrow", "Methods"));
      const methodList = createNode("ul", "mini-list");
      project.methods.forEach((method) => {
        methodList.appendChild(createNode("li", null, method));
      });
      card.appendChild(methodList);
    }

    if (project.highlights && project.highlights.length > 0) {
      card.appendChild(createNode("p", "eyebrow", "Highlights"));
      const highlightList = createNode("ul", "mini-list");
      project.highlights.forEach((highlight) => {
        highlightList.appendChild(createNode("li", null, highlight));
      });
      card.appendChild(highlightList);
    }

    grid.appendChild(card);
  });
}

function renderWork(workItems) {
  const list = document.getElementById("work-list");
  if (!list) {
    return;
  }
  list.innerHTML = "";

  workItems.forEach((item) => {
    const block = createNode("article", "work-item");
    const heading = createNode(
      "h3",
      null,
      `${item.title} (${item.year})`
    );
    block.appendChild(heading);
    block.appendChild(createNode("p", null, `${item.type} | ${item.venue}`));
    block.appendChild(createNode("p", null, item.note));
    list.appendChild(block);
  });
}

function renderJourney(entries) {
  const list = document.getElementById("journey-list");
  if (!list) {
    return;
  }
  list.innerHTML = "";

  entries.forEach((entry) => {
    const li = createNode("li");
    const title = createNode("strong", null, `${entry.period} - ${entry.title}`);
    li.appendChild(title);
    li.appendChild(createNode("p", null, entry.description));
    list.appendChild(li);
  });
}

function renderCv(cv) {
  setText("cv-label", cv.label);
  setText("cv-note", cv.note);
  setText("cv-updated", `Last CV update: ${cv.updated}`);
  const link = document.getElementById("cv-link");
  if (link) {
    link.href = cv.path;
  }
}

function applySectionObservers() {
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
  const byHash = new Map(navLinks.map((link) => [link.getAttribute("href"), link]));

  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        navLinks.forEach((link) => link.classList.remove(NAV_ACTIVE_CLASS));
        const match = byHash.get(`#${entry.target.id}`);
        if (match) {
          match.classList.add(NAV_ACTIVE_CLASS);
        }
      });
    },
    { rootMargin: "-35% 0px -50% 0px", threshold: 0.1 }
  );

  sections.forEach((section) => activeObserver.observe(section));
}

function applyRevealObserver() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  document.querySelectorAll(".reveal").forEach((section) => revealObserver.observe(section));
}

function wireMobileNav() {
  const body = document.body;
  const toggle = document.getElementById("nav-toggle");
  const navLinks = document.querySelectorAll(".site-nav a");
  if (!toggle) {
    return;
  }

  toggle.addEventListener("click", () => {
    const next = !body.classList.contains("nav-open");
    body.classList.toggle("nav-open", next);
    toggle.setAttribute("aria-expanded", String(next));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

async function init() {
  try {
    const response = await fetch("content/site.json", { cache: "no-store" });
    const data = await response.json();

    setText("hero-role", data.profile.role);
    setText("hero-name", data.profile.name);
    setText("hero-tagline", data.profile.tagline);
    setText("hero-summary", data.profile.summary);
    setText("last-updated", data.last_updated);

    renderChipLinks("hero-links", data.profile.quick_links);
    renderResearchFocus(data.research_focus);
    renderProjects(data.research_projects);
    renderWork(data.selected_work);
    renderJourney(data.timeline);
    renderCv(data.cv);
    renderChipLinks("contact-links", data.contact_links);

    applySectionObservers();
    applyRevealObserver();
    wireMobileNav();
  } catch (error) {
    // Fallback to visible message if content JSON fails to load.
    const root = document.querySelector("main");
    if (root) {
      root.innerHTML =
        "<section class='section'><h2>Unable to load content.</h2><p>Please check that <code>content/site.json</code> is available.</p></section>";
    }
  }
}

init();
