// Skill Gap for a Target Role — client logic.
// Talks to the team's own read-only API (the postings-api edge function).
// No database key lives in the browser; the anon key only authorizes calling
// the function, which reads postings server-side with the service role.

const SKILLS_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/postings-api`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const state = {
  // postings: { role, skills: string[], collected_on }[]
  // shared collection date derived from rows.
  postings: [],
  loadError: "",
};

// --- helpers --------------------------------------------------------------

// Route every network request through one helper so failures are handled
// uniformly and no uncaught exception reaches the console (per CLAUDE.md).
async function fetchPostings() {
  try {
    const response = await fetch(SKILLS_API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ANON_KEY}`,
        "Content-Type": "application/json",
        Apikey: ANON_KEY,
      },
    });

    if (response.status === 405) {
      // F1-9: a write attempt was refused by the API.
      return { error: "Writes are not allowed. This API is read-only." };
    }
    if (!response.ok) {
      return { error: `Could not reach the posting API (status ${response.status}).` };
    }

    const body = await response.json();
    if (!body || !Array.isArray(body.postings)) {
      return { error: "The posting API returned an unexpected response." };
    }

    // Validate each row before binding it into the UI.
    const clean = body.postings.filter(
      (row) =>
        row &&
        typeof row.role === "string" &&
        Array.isArray(row.skills) &&
        typeof row.collected_on === "string",
    );
    return { postings: clean };
  } catch (networkError) {
    // Network failure — preserve any user input; show a visible message.
    return { error: "Network problem prevented loading the posting set." };
  }
}

// F1-3: match without regard to capitalization or extra spaces.
function normalizeSkill(skill) {
  return String(skill).trim().toLowerCase().replace(/\s+/g, " ");
}

function parseSkills(input) {
  if (typeof input !== "string") return [];
  return input
    .split(",")
    .map((piece) => piece.trim())
    .filter((piece) => piece.length > 0);
}

// Sorted unique set of roles present in the posting set (F1-1: choose one
// target role from the roles in the posting set).
function uniqueRoles(postings) {
  const seen = new Set();
  const roles = [];
  for (const posting of postings) {
    if (!seen.has(posting.role)) {
      seen.add(posting.role);
      roles.push(posting.role);
    }
  }
  return roles.sort((a, b) => a.localeCompare(b));
}

// Union of skills across all postings for a role, plus the shared collection
// date for the posting set.
function summarizeRole(postings, role) {
  const skillSet = new Set();
  let collectedOn = null;
  for (const posting of postings) {
    if (posting.role === role) {
      for (const skill of posting.skills) skillSet.add(skill);
      // The posting set shares one collection date; keep the first seen.
      if (collectedOn === null) collectedOn = posting.collected_on;
    }
  }
  const skills = Array.from(skillSet).sort((a, b) => a.localeCompare(b));
  return { skills, collectedOn };
}

function formatCollectedDate(isoDate) {
  // Show the date in a readable form without implying it is current.
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// --- rendering ------------------------------------------------------------

// textContent only — user-supplied and API-supplied strings never go through
// innerHTML (per CLAUDE.md "What AI May Never Do Here").
function renderError(container, message) {
  container.replaceChildren();
  const card = document.createElement("div");
  card.className = "result__card";
  const para = document.createElement("p");
  para.className = "result__error";
  para.textContent = message;
  card.appendChild(para);
  container.appendChild(card);
}

function renderGap(container, { role, missingSkills, collectedOn }) {
  container.replaceChildren();
  const card = document.createElement("div");
  card.className = "result__card";

  const heading = document.createElement("h2");
  heading.className = "result__heading";
  heading.textContent = `Skill gap for ${role}`;
  card.appendChild(heading);

  // F1-4: show the collection date next to every result so a frozen snapshot
  // is never read as current.
  const collected = document.createElement("p");
  collected.className = "result__collected";
  collected.textContent = `Posting set collected on ${formatCollectedDate(collectedOn)}.`;
  card.appendChild(collected);

  if (missingSkills.length === 0) {
    // F1-7: no gap — say so instead of showing an empty list.
    const note = document.createElement("p");
    note.className = "result__note";
    note.textContent =
      "No gap was found — you already have every skill listed in the postings for this role.";
    card.appendChild(note);
  } else {
    const list = document.createElement("ul");
    list.className = "result__list";
    for (const skill of missingSkills) {
      const item = document.createElement("li");
      item.className = "result__item";
      item.textContent = skill;
      list.appendChild(item);
    }
    card.appendChild(list);
  }

  container.appendChild(card);
}

function renderNoPostings(container, role, collectedOn) {
  container.replaceChildren();
  const card = document.createElement("div");
  card.className = "result__card";

  const heading = document.createElement("h2");
  heading.className = "result__heading";
  heading.textContent = `No postings for ${role}`;
  card.appendChild(heading);

  const note = document.createElement("p");
  note.className = "result__note";
  // F1-6: name the role and do not show a gap.
  note.textContent = `There are no postings for ${role} in the current posting set, so no skill gap can be shown.`;
  card.appendChild(note);

  if (collectedOn) {
    const collected = document.createElement("p");
    collected.className = "result__collected";
    collected.textContent = `Posting set collected on ${formatCollectedDate(collectedOn)}.`;
    card.appendChild(collected);
  }

  container.appendChild(card);
}

// --- form handling --------------------------------------------------------

function populateRoles(roles) {
  const select = document.getElementById("role-select");
  select.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a role…";
  select.appendChild(placeholder);

  for (const role of roles) {
    const option = document.createElement("option");
    option.value = role;
    option.textContent = role;
    select.appendChild(option);
  }
}

function setFieldError(elementId, message) {
  const el = document.getElementById(elementId);
  el.textContent = message;
}

function clearFieldErrors() {
  setFieldError("skills-error", "");
  setFieldError("role-error", "");
}

function handleSubmit(event) {
  event.preventDefault();
  const resultContainer = document.getElementById("result");
  const skillsInput = document.getElementById("skills-input");
  const roleSelect = document.getElementById("role-select");

  clearFieldErrors();
  resultContainer.replaceChildren();

  const rawSkills = skillsInput.value;
  const skills = parseSkills(rawSkills);
  const role = roleSelect.value;

  // F1-5: require at least one skill; do not show a result otherwise.
  if (skills.length === 0) {
    setFieldError(
      "skills-error",
      "Please enter at least one skill before checking your gap.",
    );
    skillsInput.focus();
    return;
  }

  if (!role) {
    setFieldError("role-error", "Please choose a target role.");
    roleSelect.focus();
    return;
  }

  if (state.postings.length === 0) {
    renderError(
      resultContainer,
      "No postings are available right now. Please try again later.",
    );
    return;
  }

  const { skills: roleSkills, collectedOn } = summarizeRole(state.postings, role);

  // F1-6: target role has no postings in the data set.
  if (roleSkills.length === 0) {
    renderNoPostings(resultContainer, role, collectedOn);
    return;
  }

  // F1-2 + F1-3: list skills in postings for that role that are missing from
  // the student's list, matched without regard to case or extra spaces.
  const haveSet = new Set(skills.map(normalizeSkill));
  const missingSkills = roleSkills.filter(
    (skill) => !haveSet.has(normalizeSkill(skill)),
  );

  renderGap(resultContainer, { role, missingSkills, collectedOn });
}

// --- init -----------------------------------------------------------------

async function init() {
  const roleSelect = document.getElementById("role-select");
  const pageStatus = document.getElementById("page-status");

  const form = document.getElementById("gap-form");
  form.addEventListener("submit", handleSubmit);

  const { postings, error } = await fetchPostings();
  if (error) {
    state.postings = [];
    state.loadError = error;
    roleSelect.replaceChildren();
    const disabled = document.createElement("option");
    disabled.value = "";
    disabled.textContent = "Roles unavailable";
    roleSelect.appendChild(disabled);
    pageStatus.textContent = error;
    return;
  }

  state.postings = postings;
  populateRoles(uniqueRoles(postings));
}

init();
