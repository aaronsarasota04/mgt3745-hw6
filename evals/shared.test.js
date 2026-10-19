import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const postings = [
  {
    role: "Data Analyst",
    skills: ["Python", "SQL"],
    collected_on: "2026-10-08",
  },
  {
    role: "Data Engineer",
    skills: ["Python", "Kubernetes"],
    collected_on: "2026-10-08",
  },
];

class Element {
  constructor(id = "") {
    this.id = id;
    this.children = [];
    this.listeners = new Map();
    this.value = "";
    this.hidden = id === "result-card";
    this.className = "";
    this._textContent = "";
    this.classList = {
      add() {},
      remove() {},
    };
  }

  get textContent() {
    return this._textContent + this.children.map((child) => child.textContent).join("");
  }

  get firstChild() {
    return this.children[0] ?? null;
  }

  get options() {
    return this.children;
  }

  set textContent(value) {
    this._textContent = String(value);
    this.children = [];
  }

  append(...elements) {
    this.children.push(...elements);
  }

  appendChild(element) {
    this.append(element);
    return element;
  }

  removeChild(element) {
    this.children = this.children.filter((child) => child !== element);
    return element;
  }

  remove(index) {
    this.children.splice(index, 1);
  }

  replaceChildren(...elements) {
    this._textContent = "";
    this.children = [...elements];
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  focus() {}
}

async function loadBuild(name, { skills = "", role = "Data Engineer", emptySkills = false } = {}) {
  const html = await readFile(path.join(directory, "impl", `${name}.html`), "utf8");
  let source = await readFile(path.join(directory, "impl", `${name}.js`), "utf8");
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const elements = new Map(ids.map((id) => [id, new Element(id)]));
  const roleSelectId = name === "bolt" ? "role-select" : "target-role-select";
  const selectMatch = html.match(new RegExp(`<select[^>]*id="${roleSelectId}"[^>]*>([\\s\\S]*?)<\\/select>`));
  for (const [, value, label] of selectMatch?.[1].matchAll(/<option[^>]*value="([^"]*)"[^>]*>([\s\S]*?)<\/option>/g) ?? []) {
    const option = new Element();
    option.value = value;
    option.textContent = label.replace(/<[^>]+>/g, "").trim();
    elements.get(roleSelectId).appendChild(option);
  }
  const requests = [];

  const document = {
    getElementById(id) {
      return elements.get(id) ?? null;
    },
    querySelector(selector) {
      return elements.get(selector.replace(/^#/, "")) ?? null;
    },
    createElement() {
      return new Element();
    },
    createTextNode(text) {
      const node = new Element();
      node.textContent = text;
      return node;
    },
  };
  const localStorage = new Map([
    [
      "mgt3745.job-fit.v1",
      JSON.stringify({
        userSkills: emptySkills ? "" : skills,
        jobText: "Python, Kubernetes",
      }),
    ],
  ]);
  const fetch = async (url, options = {}) => {
    const method = options.method ?? "GET";
    requests.push({ url: String(url), method });
    if (method !== "GET" && String(url).includes("/api/postings")) {
      return { ok: false, status: 405, json: async () => ({ error: "Method not allowed" }), text: async () => "Method not allowed" };
    }
    const isPostings =
      String(url).includes("/functions/v1/postings-api") ||
      String(url) === "/api/postings";
    if (isPostings) {
      const payload =
        name === "aistudio"
          ? {
              collectionDate: "October 8, 2026",
              roles: [...new Set(postings.map(({ role }) => role))],
              postings,
            }
          : { postings };
      return {
        ok: true,
        status: 200,
        json: async () => payload,
        text: async () => "",
      };
    }
    return {
      ok: true,
      status: 200,
      json: async () => [],
      text: async () => "",
    };
  };

  if (name === "bolt") {
    source = source
      .replaceAll("import.meta.env.VITE_SUPABASE_URL", '"https://team.example"')
      .replaceAll("import.meta.env.VITE_SUPABASE_ANON_KEY", '"public-test-key"')
      .replace(/\binit\(\);\s*$/, "globalThis.__appReady = init();");
  } else {
    source = source.replace(
      "loadTeamPostingData();",
      "globalThis.__appReady = loadTeamPostingData();",
    );
  }

  const context = vm.createContext({
    document,
    fetch,
    window: {
      localStorage: {
        getItem: (key) => localStorage.get(key) ?? null,
        setItem: (key, value) => localStorage.set(key, value),
      },
    },
    console,
    Date,
    Set,
    Map,
    JSON,
    Math,
  });
  vm.runInContext(source, context, { filename: `${name}.js` });
  await context.__appReady;

  const roleSelect = elements.get(roleSelectId);
  if (roleSelect) roleSelect.value = role;
  const skillsInput = elements.get(name === "bolt" ? "skills-input" : "student-skills-input");
  if (skillsInput) skillsInput.value = emptySkills ? "" : skills;
  const jobInput = elements.get("job-input");
  if (jobInput) jobInput.value = "Python, Kubernetes";

  return {
    elements,
    requests,
    html,
    source,
    roleSelect,
    skillsInput,
    result: elements.get(name === "bolt" ? "result" : "results-body"),
    validationMessage: elements.get(name === "bolt" ? "skills-error" : "skills-validation-message"),
    async submit() {
      const handler =
        elements.get(name === "bolt" ? "gap-form" : "skill-gap-form")?.listeners.get("submit") ??
        elements.get("evaluate-button")?.listeners.get("click");
      assert.ok(handler, `${name} must provide an evaluation action`);
      await handler({ preventDefault() {} });
    },
  };
}

function forEachBuild(description, assertBehavior, options = {}) {
  for (const name of ["bolt", "aistudio"]) {
    test(`${name}: ${description}`, async () => {
      await assertBehavior(name, await loadBuild(name, options));
    });
  }
}

forEachBuild("EARS 1: choose one target role from roles in the postings", (name, app) => {
    const roles = app.roleSelect?.children.map((option) => option.value) ?? [];
    assert.deepEqual(roles, ["", "Data Analyst", "Data Engineer"], `${name} role options`);
});

forEachBuild("EARS 2: show posting skills for the selected role that the student lacks", async (name, app) => {
    const role = app.roleSelect;
    assert.ok(role, `${name} must let the student select a role`);
    role.value = "Data Engineer";
    app.skillsInput.value = "Python";
    await app.submit();
    const result = app.result?.textContent ?? "";
    assert.match(result, /Kubernetes/, `${name} must show the missing posting skill`);
    assert.doesNotMatch(result, /Data Analyst|SQL/, `${name} must not mix in another role`);
});

forEachBuild("EARS 3: match skill names without regard to case or extra spaces", async (name, app) => {
    const role = app.roleSelect;
    if (role) role.value = "Data Engineer";
    app.skillsInput.value = "  pYtHoN   ,  kUbErNeTeS  ";
    if (app.elements.get("job-input")) {
      app.elements.get("job-input").value = "Python, Kubernetes";
    }
    await app.submit();
    if (role) {
      assert.match(
        app.result?.textContent ?? "",
        /no (?:skill )?gap (?:was )?found/i,
        `${name} should treat normalized skills as present`,
      );
    } else {
      assert.equal(app.elements.get("match-score")?.textContent, "100%", `${name} score`);
      assert.equal(app.elements.get("missing-list")?.children.length, 0, `${name} missing skills`);
    }
});

forEachBuild("EARS 4: show the posting-set collection date with each result", async (name, app) => {
    const role = app.roleSelect;
    assert.ok(role, `${name} must support a result for a selected posting role`);
    role.value = "Data Engineer";
    app.skillsInput.value = "Python";
    await app.submit();
    const result = app.result?.textContent ?? "";
    assert.match(result, /October 8, 2026|8 October 2026/, `${name} result date`);
});

forEachBuild("EARS 5: require at least one skill and show no result when none are entered", async (name, app) => {
    await app.submit();
    const message = app.validationMessage?.textContent ?? "";
    assert.match(message, /at least one skill/i, `${name} validation message`);
    assert.equal(
      name === "bolt"
        ? app.result?.children.length === 0
        : !app.result?.children.some((child) => !/empty-placeholder/.test(child.className)),
      true,
      `${name} must not show a result`,
    );
}, { emptySkills: true });

forEachBuild("EARS 6: name a role with no postings and do not show a gap", async (name, app) => {
    const role = app.roleSelect;
    assert.ok(role, `${name} must let the student choose a target role`);
    role.value = "No Posting Role";
    app.skillsInput.value = "Python";
    await app.submit();
    const result = app.result?.textContent ?? "";
    assert.match(result, /No Posting Role/i, `${name} must name the selected role`);
    assert.match(result, /no postings/i, `${name} must explain the empty posting set`);
    assert.doesNotMatch(result, /skill gap for/i, `${name} must not show a gap`);
});

forEachBuild("EARS 7: say no gap was found instead of showing an empty list", async (name, app) => {
    const role = app.roleSelect;
    assert.ok(role, `${name} must support target-role comparisons`);
    role.value = "Data Engineer";
    app.skillsInput.value = "Python, Kubernetes";
    await app.submit();
    const result = app.result?.textContent ?? "";
    const noGapMessage = "";
    assert.match(`${result} ${noGapMessage}`, /no (?:skill )?gap (?:was )?found/i, `${name} no-gap message`);
    assert.doesNotMatch(result, /<ul/i, `${name} must not render an empty gap list`);
});

forEachBuild("EARS 8: read postings through the team's API without a browser database key", (name, app) => {
    assert.ok(
      app.requests.some(
        ({ url, method }) =>
          (url.includes("/functions/v1/postings-api") || url === "/api/postings") && method === "GET",
      ),
      `${name} must read the posting set through the team's API`,
    );
    assert.doesNotMatch(
      `${app.source}\n${app.html}`,
      /service[_-]?role|database[_-]?password|postgres(?:ql)?:\/\//i,
      `${name} must not include a database key in browser code`,
    );
});

forEachBuild("EARS 9: refuse browser requests that attempt to mutate postings", async (name, app) => {
    const mutationButton = app.elements.get("test-mutation-refusal-btn");
    if (mutationButton) {
      await mutationButton.listeners.get("click")();
      assert.ok(app.requests.some(({ method }) => method === "POST"), `${name} must attempt a posting write`);
      assert.ok(app.requests.some(({ method }) => method === "DELETE"), `${name} must attempt a posting deletion`);
      assert.match(app.elements.get("mutation-test-output").textContent, /405/g, `${name} must report refusal`);
      return;
    }

    const postingRequests = app.requests.filter(({ url }) =>
      url.includes("/functions/v1/postings-api") || url === "/api/postings",
    );
    assert.ok(postingRequests.length > 0, `${name} must contact the postings API`);
    assert.ok(
      postingRequests.every(({ method }) => method === "GET"),
      `${name} must not send browser-side posting mutations`,
    );
    assert.doesNotMatch(
      app.html,
      /(?:add|edit|update|delete|remove)\s+(?:a\s+)?posting/i,
      `${name} must not expose a posting mutation control`,
    );
});

forEachBuild("EARS 10: display only supplied posting skills and collection date", async (name, app) => {
    const role = app.roleSelect;
    assert.ok(role, `${name} must display data from a selected posting`);
    role.value = "Data Engineer";
    app.skillsInput.value = "Python";
    await app.submit();
    const result = app.result?.textContent ?? "";
    assert.match(result, /Kubernetes/, `${name} must display the supplied missing skill`);
    assert.doesNotMatch(result, /Tableau|Machine Learning/, `${name} must not invent skills`);
    assert.match(result, /October 8, 2026|8 October 2026/, `${name} must use supplied collection date`);
});
