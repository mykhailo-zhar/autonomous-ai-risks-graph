const publicationsSelect = document.querySelector("#publications");
const evidenceSelect = document.querySelector("#evidence");
const status = document.querySelector("#status");
const toggleEvidenceLabels = document.querySelector("#toggle-evidence-labels");
let showEvidenceIds = true;

const ALL = "";

const selected = (select) => [...select.selectedOptions].map((option) => option.value);

function addAllOption(select) {
  const option = document.createElement("option");
  option.value = ALL;
  option.textContent = "All";
  select.prepend(option);
}

function syncAllOption(select, previouslyHadAll) {
  const allOption = [...select.options].find((option) => option.value === ALL);
  const specifics = [...select.options].filter((option) => option.value !== ALL);
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
  const specifics = [...select.options].filter((option) => option.value !== ALL);
  if (allOption?.selected || (specifics.length > 0 && specifics.every((option) => option.selected))) {
    return new Set();
  }
  return new Set(selected(select).filter((value) => value !== ALL));
}

function pairs(ids) {
  const edges = [];
  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      edges.push([ids[i], ids[j]]);
    }
  }
  return edges;
}

function fillEvidenceOptions(evidence, publicationIds) {
  const previous = new Set(selected(evidenceSelect));
  const hadAll = previous.has(ALL);
  evidenceSelect.replaceChildren();
  addAllOption(evidenceSelect);
  for (const item of evidence) {
    if (publicationIds.size && !publicationIds.has(String(item.publication_id))) continue;
    const option = document.createElement("option");
    option.value = item.ev_id;
    option.textContent = item.ev_id;
    option.selected = hadAll || previous.has(item.ev_id);
    evidenceSelect.append(option);
  }
  syncAllOption(evidenceSelect, false);
}

function draw(risks, evidence) {
  const publicationIds = activeValues(publicationsSelect);
  const evidenceIds = activeValues(evidenceSelect);
  const visibleEvidence = evidence.filter((item) => {
    if (item.risks.length === 0) return false;
    if (publicationIds.size && !publicationIds.has(String(item.publication_id))) return false;
    if (evidenceIds.size && !evidenceIds.has(item.ev_id)) return false;
    return true;
  });

  const riskById = new Map(risks.map((risk) => [risk.risk_id, risk]));
  const nodeIds = new Set();
  for (const item of visibleEvidence) {
    for (const riskId of item.risks) nodeIds.add(riskId);
  }

  const nodes = [...nodeIds].map((riskId) => {
    const risk = riskById.get(riskId);
    return {
      id: riskId,
      label: risk.label,
      value: risk.number_of_associated_records,
      title: `${risk.label} (${risk.number_of_associated_records} records)`,
    };
  });

  const edges = [];
  for (const item of visibleEvidence) {
    if (item.risks.length < 2) continue;
    for (const [from, to] of pairs(item.risks)) {
      edges.push({
        id: `${item.ev_id}:${from}:${to}`,
        from,
        to,
        label: showEvidenceIds ? item.ev_id : "",
        title: item.ev_id,
      });
    }
  }

  const riskWord = nodes.length === 1 ? "risk" : "risks";
  const edgeWord = edges.length === 1 ? "edge" : "edges";
  status.textContent = `${nodes.length} ${riskWord}, ${edges.length} ${edgeWord}`;
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
        font: { size: 11, align: "middle", strokeWidth: 4, strokeColor: "#ffffff" },
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
    const data = draw(risks, evidence);
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
  toggleEvidenceLabels.addEventListener("click", () => {
    showEvidenceIds = !showEvidenceIds;
    toggleEvidenceLabels.textContent = showEvidenceIds ? "Hide evidence ids" : "Show evidence ids";
    show();
  });
  show();
}

main().catch((error) => {
  status.textContent = error.message;
});
