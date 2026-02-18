const NAV_ACTIVE_CLASS = "is-active";
const THEME_STORAGE_KEY = "site-theme";
const THEME_DARK = "dark";
const THEME_LIGHT = "light";

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

function setLastUpdated(value) {
  document.querySelectorAll(".last-updated").forEach((node) => {
    node.textContent = value || "";
  });
}

function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    // Ignore storage failures in restricted browser environments.
  }
}

function getInitialTheme() {
  const savedTheme = getSavedTheme();
  if (savedTheme === THEME_DARK || savedTheme === THEME_LIGHT) {
    return savedTheme;
  }
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  return prefersLight ? THEME_LIGHT : THEME_DARK;
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  const toggle = document.getElementById("theme-toggle");
  if (!toggle) {
    return;
  }

  const isLight = theme === THEME_LIGHT;
  toggle.textContent = isLight ? "Dark" : "Light";
  toggle.setAttribute("aria-pressed", String(isLight));
  toggle.setAttribute(
    "aria-label",
    isLight ? "Switch to dark mode" : "Switch to light mode"
  );
}

function wireThemeToggle() {
  applyTheme(getInitialTheme());

  const toggle = document.getElementById("theme-toggle");
  if (!toggle) {
    return;
  }

  toggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = currentTheme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
    applyTheme(nextTheme);
    saveTheme(nextTheme);
  });
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

function wireActiveNav() {
  const currentPage = document.body.dataset.page;
  if (!currentPage) {
    return;
  }

  const currentLink = document.querySelector(`[data-page-link="${currentPage}"]`);
  if (!currentLink) {
    return;
  }

  currentLink.classList.add(NAV_ACTIVE_CLASS);
  currentLink.setAttribute("aria-current", "page");
}

function renderHero(profile) {
  if (!document.getElementById("hero-name")) {
    return;
  }

  setText("hero-role", profile.role);
  setText("hero-name", profile.name);
  setText("hero-tagline", profile.tagline);
  setText("hero-summary", profile.summary);

  const image = document.getElementById("hero-photo");
  if (image && profile.headshot) {
    if (profile.headshot.src) {
      image.src = profile.headshot.src;
    }
    if (profile.headshot.alt) {
      image.alt = profile.headshot.alt;
    }
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
    if (link.href.startsWith("http")) {
      anchor.target = "_blank";
      anchor.rel = "noopener";
    }
    container.appendChild(anchor);
  });
}

function renderList(containerId, items) {
  const list = document.getElementById(containerId);
  if (!list) {
    return;
  }

  list.innerHTML = "";
  items.forEach((item) => {
    list.appendChild(createNode("li", null, item));
  });
}

function renderHomeProjectPreview(projects) {
  const list = document.getElementById("home-project-preview");
  if (!list) {
    return;
  }

  list.innerHTML = "";
  projects.slice(0, 2).forEach((project) => {
    const item = createNode("li");
    item.appendChild(createNode("strong", null, project.title));
    item.appendChild(createNode("span", null, `${project.theme} | ${project.status}`));
    list.appendChild(item);
  });
}

function renderTimeline(timeline) {
  const list = document.getElementById("timeline-list");
  if (!list) {
    return;
  }

  list.innerHTML = "";
  timeline.forEach((entry) => {
    const item = createNode("li", "timeline-item");
    item.appendChild(createNode("span", "period", entry.period));
    item.appendChild(createNode("h3", null, entry.title));
    item.appendChild(createNode("p", null, entry.description));
    list.appendChild(item);
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

function renderCv(cv) {
  setText("cv-label", cv.label);
  setText("cv-note", cv.note);
  setText("cv-updated", `Last CV update: ${cv.updated}`);
  const link = document.getElementById("cv-link");
  if (link) {
    link.href = cv.path;
  }
}

async function init() {
  wireThemeToggle();
  wireMobileNav();
  wireActiveNav();

  try {
    const response = await fetch("content/site.json", { cache: "no-store" });
    const data = await response.json();

    setLastUpdated(data.last_updated);
    renderHero(data.profile);
    renderChipLinks("hero-links", data.profile.quick_links);
    renderList("home-research-preview", data.research_focus.slice(0, 2));
    renderList("research-focus-list", data.research_focus);
    renderHomeProjectPreview(data.research_projects);
    renderProjects(data.research_projects);
    renderTimeline(data.timeline || []);
    renderCv(data.cv);
  } catch (error) {
    const root = document.querySelector("main");
    if (root) {
      root.innerHTML =
        "<section class='section-block'><h2>Unable to load content.</h2><p>Please check that <code>content/site.json</code> is available.</p></section>";
    }
  }
}

init();
