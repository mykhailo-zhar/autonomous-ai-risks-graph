const publicationsSelect = document.querySelector("#publications");
const evidenceSelect = document.querySelector("#evidence");
const publicationSearch = document.querySelector("#publication-search");
const evidenceSearch = document.querySelector("#evidence-search");
const status = document.querySelector("#status");

const ALL = "";

const selected = (select) =>
  [...select.selectedOptions].map((option) => option.value);

function addAllOption(select) {
  const option = document.createElement("option");
  option.value = ALL;
  option.textContent = "All";
  select.prepend(option);
}

function syncAllOption(select, previouslyHadAll) {
  const allOption = [...select.options].find((option) => option.value === ALL);
  const specifics = [...select.options].filter(
    (option) => option.value !== ALL,
  );
  if (!allOption) return;
  if (allOption.selected && !previouslyHadAll) {
    for (const option of specifics) option.selected = true;
    return;
  }
  if (allOption.selected && specifics.some((option) => !option.selected)) {
    allOption.selected = false;
    return;
  }
  if (specifics.length > 0 && specifics.every((option) => option.selected)) {
    allOption.selected = true;
  }
}

function activeValues(select) {
  const allOption = [...select.options].find((option) => option.value === ALL);
  const specifics = [...select.options].filter(
    (option) => option.value !== ALL,
  );
  if (
    allOption?.selected ||
    (specifics.length > 0 && specifics.every((option) => option.selected))
  ) {
    return new Set();
  }
  return new Set(selected(select).filter((value) => value !== ALL));
}

function filterOptions(select, query) {
  const needle = query.trim().toLowerCase();
  for (const option of select.options) {
    if (option.value === ALL) continue;
    option.hidden =
      needle !== "" && !option.textContent.toLowerCase().includes(needle);
  }
}

function fillEvidenceOptions(evidence, publicationIds) {
  const previous = new Set(selected(evidenceSelect));
  const hadAll = previous.has(ALL);
  evidenceSelect.replaceChildren();
  addAllOption(evidenceSelect);
  for (const item of evidence) {
    if (publicationIds.size && !publicationIds.has(String(item.publication_id)))
      continue;
    const option = document.createElement("option");
    option.value = item.ev_id;
    option.textContent = item.ev_id;
    option.selected = hadAll || previous.has(item.ev_id);
    evidenceSelect.append(option);
  }
  syncAllOption(evidenceSelect, false);
  filterOptions(evidenceSelect, evidenceSearch.value);
}

function countLabelInline(count, singular, plural) {
  return `(${count === 1 ? singular : plural}: ${count})`;
}

function countLabel(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function draw(risks, evidence, publications) {
  const publicationIds = activeValues(publicationsSelect);
  const evidenceIds = activeValues(evidenceSelect);
  const visibleEvidence = evidence.filter((item) => {
    if (publicationIds.size && !publicationIds.has(String(item.publication_id)))
      return false;
    if (evidenceIds.size && !evidenceIds.has(item.ev_id)) return false;
    return true;
  });
  const visiblePublicationIds = new Set(
    visibleEvidence.map((item) => String(item.publication_id)),
  );
  const visiblePublications = publications.filter((publication) => {
    const id = String(publication.publication_id);
    if (publicationIds.size && !publicationIds.has(id)) return false;
    if (evidenceIds.size && !visiblePublicationIds.has(id)) return false;
    return true;
  });

  const riskById = new Map(risks.map((risk) => [risk.risk_id, risk]));
  const riskIds = new Set();
  if (!publicationIds.size && !evidenceIds.size) {
    for (const risk of risks) riskIds.add(risk.risk_id);
  } else {
    for (const item of visibleEvidence) {
      for (const riskId of item.risks) riskIds.add(riskId);
    }
  }

  const nodes = [
    ...visiblePublications.map((publication) => ({
      id: `pub:${publication.publication_id}`,
      label: `${publication.publication_id}. ${publication.title}`,
      shape: "triangle",
      size: publication.number_of_associated_risks,
      color: { background: "#22c55e", border: "#15803d" },
      title: [
        `${publication.publication_id}. ${publication.title}`,
        countLabelInline(
          publication.number_of_associated_ev_ids,
          "evidence id",
          "evidence ids",
        ),
        countLabelInline(
          publication.number_of_associated_risks,
          "risk",
          "risks",
        ),
      ].join(" "),
    })),
    ...visibleEvidence.map((item) => ({
      id: `ev:${item.ev_id}`,
      label: item.ev_id,
      shape: "square",
      size: item.number_of_associated_risks + 2,
      color: { background: "#a855f7", border: "#6b21a8" },
      title: [
        item.ev_id,
        countLabelInline(item.number_of_associated_risks, "risk", "risks"),
      ].join(" "),
    })),
    ...[...riskIds].map((riskId) => {
      const risk = riskById.get(riskId);
      return {
        id: `risk:${riskId}`,
        label: risk.label,
        shape: "dot",
        value: risk.number_of_associated_records + 3,
        title: [
          risk.label,
          countLabelInline(
            risk.number_of_associated_publications,
            "publication",
            "publications",
          ),
          countLabelInline(
            risk.number_of_associated_records,
            "record",
            "records",
          ),
        ].join(" "),
      };
    }),
  ];

  const edges = [];
  for (const item of visibleEvidence) {
    edges.push({
      id: `pub-ev:${item.publication_id}:${item.ev_id}`,
      from: `pub:${item.publication_id}`,
      to: `ev:${item.ev_id}`,
      color: { color: "#16a34a", highlight: "#15803d" },
    });
    for (const riskId of item.risks) {
      edges.push({
        id: `ev-risk:${item.ev_id}:${riskId}`,
        from: `ev:${item.ev_id}`,
        to: `risk:${riskId}`,
        title: item.ev_id,
      });
    }
  }

  status.textContent = [
    countLabel(visiblePublications.length, "publication", "publications"),
    countLabel(visibleEvidence.length, "evidence id", "evidence ids"),
    countLabel(riskIds.size, "risk", "risks"),
    countLabel(edges.length, "edge", "edges"),
  ].join(", ");
  return { nodes, edges };
}

async function main() {
  const [risks, evidence, publications] = await Promise.all([
    fetch("../output/risks.json").then((response) => response.json()),
    fetch("../output/ev_ids.json").then((response) => response.json()),
    fetch("../output/publications.json").then((response) => response.json()),
  ]);

  addAllOption(publicationsSelect);
  for (const publication of publications) {
    const option = document.createElement("option");
    option.value = String(publication.publication_id);
    option.textContent = `${publication.publication_id}. ${publication.title}`;
    publicationsSelect.append(option);
  }
  fillEvidenceOptions(evidence, new Set());

  const graph = new vis.Network(
    document.querySelector("#graph"),
    { nodes: [], edges: [] },
    {
      nodes: {
        shape: "dot",
        scaling: { min: 8, max: 36, label: { enabled: false } },
        font: { size: 14, face: "system-ui" },
      },
      edges: {
        font: {
          size: 11,
          align: "middle",
          strokeWidth: 4,
          strokeColor: "#ffffff",
        },
        color: { color: "#a8a29e", highlight: "#44403c" },
        smooth: { type: "continuous" },
      },
      physics: {
        solver: "forceAtlas2Based",
        forceAtlas2Based: { gravitationalConstant: -40, springLength: 120 },
        stabilization: { iterations: 200 },
      },
      interaction: { hover: true, tooltipDelay: 100 },
    },
  );

  const show = () => {
    const data = draw(risks, evidence, publications);
    graph.setData(data);
  };

  let publicationsHadAll = false;
  let evidenceHadAll = false;
  publicationsSelect.addEventListener("change", () => {
    syncAllOption(publicationsSelect, publicationsHadAll);
    publicationsHadAll = selected(publicationsSelect).includes(ALL);
    fillEvidenceOptions(evidence, activeValues(publicationsSelect));
    evidenceHadAll = selected(evidenceSelect).includes(ALL);
    show();
  });
  evidenceSelect.addEventListener("change", () => {
    syncAllOption(evidenceSelect, evidenceHadAll);
    evidenceHadAll = selected(evidenceSelect).includes(ALL);
    show();
  });
  publicationSearch.addEventListener("input", () => {
    filterOptions(publicationsSelect, publicationSearch.value);
  });
  evidenceSearch.addEventListener("input", () => {
    filterOptions(evidenceSelect, evidenceSearch.value);
  });
  show();
}

main().catch((error) => {
  status.textContent = error.message;
});
