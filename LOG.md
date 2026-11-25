# Log

Append an entry here whenever the repo changes. Each entry starts with a local timestamp, `YYYY-MM-DD HH:MM` (UTC+2). Do not edit `AGENTS.md` unless the user asks.

## 2026-11-24 13:08

`risk/risks-v1.tsv` is the earlier mention table. Header: `RISK_ID`, `Assotiated Ev_ID`, `Risk`, `Comment`.

## 2026-11-24 13:36

Added `mise.toml` (Python 3.13 and uv, `.venv` created on enter), `.gitignore` for `.venv/` and `.ipynb_checkpoints/`, and `preprocess.ipynb` as an anomaly report that writes no files. `requirements.txt` started with `ipykernel`.

## 2026-11-24 13:43

Table work uses Polars DataFrames. `polars` was added to `requirements.txt`, and `preprocess.ipynb` was rewritten to load a DataFrame instead of using `defaultdict`.

## 2026-11-24 14:22

`risk/risks-v2.tsv` is the mention table in use. Same header as v1. `preprocess.ipynb` reads this file.

## 2026-11-24 14:37

Added `pyproject.toml` with `ipykernel` and `polars` for Python 3.13, and generated `uv.lock` (36 packages). `requirements.txt` still lists the same two packages.

`UV_PYTHON` points at the mise interpreter, so `uv pip install` without a project target installs there. Install into `.venv` with `uv sync`, or `uv pip install --python .venv/bin/python`. Use `.venv/bin/python` as the notebook kernel.

## 2026-11-24 14:39

`risk/studies.tsv` maps evidence ids to publications: `Title`, `QuickRef`, `Ev_ID`, `Paper_ID`, `Cat_ID`. `Paper_ID` is the publication id. `Ev_ID` is a passage inside that publication, not the publication itself.

## 2026-11-24 14:46

Added `extract.ipynb`. It joins `risk/risks-v2.tsv` to `risk/studies.tsv` and does not change the TSVs. Do not add this step to `preprocess.ipynb`. Cells, from the top: setup, load risks, load studies, fill a blank `Paper_ID`, write mentions, write evidence titles.

`62.24.02a` has a blank `Paper_ID`. The notebook fills it with `62`, the only id on that title, and prints the row. `51.08.00` is in studies and has no risk rows, so it appears only on the title map.

## 2026-11-24 14:48

Wrote the derived CSVs.

- `risk/mentions.csv` — `id`, `label`, `ev_id`, `publication_id`. One row per risk coding, source order. 351 rows. Labels are stripped.
- `risk/ev_titles.csv` — `ev_id`, `publication_id`, `title`. One row per evidence id, studies order. 146 rows. Titles are stripped.

Static JSON for the webpage is not built yet.

Anomaly report on `risk/risks-v2.tsv`: six ids with conflicting labels (`3`, `10`, `32`, `35`, `66`, `111`); four labels on more than one id (`Loss of control`, `Oversight evasion`, `Oversight evasion (systems)`, `Shutdown resistance`); four `NOT CODED` rows; 17 labels with extra whitespace; 29 comments. No duplicate `(RISK_ID, ev_id)` pairs, no missing ids from 1 through 199, and no `ev_id` outside `digits.digits.digits` plus an optional letter.

## 2026-11-24 14:51

Created this log. Restored `AGENTS.md` to the project brief and stopped recording file layout there.

## 2026-11-24 14:52

Dated the entries above. `AGENTS.md` now says each repo change is appended here with a local timestamp, and is not recorded in the brief.

## 2026-11-24 15:14

Added `build_json.ipynb`. It reads `risk/mentions.csv` and `risk/ev_titles.csv` and writes `output/risks.json` (202 risks), `output/publications.json` (30 publications), and `output/ev_ids.json` (146 evidence ids). Ids stay in first-seen order. `number_of_associated_records` counts mention rows. `number_of_associated_risks` counts distinct risk ids. Risk `0` is included. Publication `51` has evidence id `51.08.00` and no risks.

## 2026-11-24 15:26

Added count fields and regenerated the three JSON files. Risks have `number_of_associated_publications` and `number_of_associated_ev_ids`. Publications have `number_of_associated_ev_ids`. Evidence ids have `number_of_associated_publications` (one each, since an evidence id belongs to one publication).

## 2026-11-24 15:28

Evidence ids now have `number_of_associated_risks`, the count of distinct risk ids on that passage. `07.03.00` has 4. `51.08.00` has 0. The evidence record is `ev_id`, `publication_id`, `number_of_associated_risks`, and `risks`. Regenerated `output/ev_ids.json`.

## 2026-11-24 15:39

Added `src/index.html`. It draws each risk as a node sized by `number_of_associated_records`, and each evidence id that names two or more risks as pair-edges labeled with that `ev_id`. Filters select publications and evidence ids. With neither set, the page shows 202 risks and 458 edges. Serve the repo and open `/src/`; a `file://` open cannot fetch the JSON.

## 2026-11-24 15:40

Moved the page style to `src/style.css` and the graph script to `src/graph.js`. `src/index.html` links those files.

## 2026-11-24 15:43

Each filter list starts with All. Choosing it selects every publication, or every evidence id currently listed, and the graph shows that full set.

## 2026-11-24 15:46

Added a Hide evidence ids button. It removes the evidence-id labels from the edges and leaves the edges in place. The button then reads Show evidence ids. Hovering an edge still shows its id.

## 2026-11-25 11:19

Rewrote `README.md` with MIT and CC BY 4.0 shields, a short description of the graph, the three changes to the MIT AI Risk Repository data, and the CC BY attribution. The derived tables and JSON stay under CC BY 4.0. The code stays MIT.

## 2026-11-25 11:27

The graph now has three node types. Publications are green triangles labeled with the id, title, evidence-id count, and risk count. Evidence passages are purple squares labeled with the `ev_id` and the risk count. Risks stay blue circles sized by `number_of_associated_records`, and the label adds the publication count. A green edge links each publication to its evidence. The gray edge links each evidence node to its risks and is still labeled with the `ev_id`. The old risk-to-risk edges are gone.

## 2026-11-25 11:34

Moved the counts off the node labels and into the hover title. Publication and evidence nodes are sized by their risk counts, each on its own scale from 8 to 36. Risk circles stay sized by `number_of_associated_records`.

## 2026-11-25 11:49

Removed the Hide evidence ids button and the toggle that blanked evidence-id edge labels. Those labels always show.

## 2026-11-25 11:51

Moved the publications and evidence filters into a right-hand panel. The graph fills the remaining space on the left.

## 2026-11-25 11:55

Kept the filter panel in a full-height column on the right. The stylesheet link now includes a version query so the browser loads this layout instead of the previous stacked one.

## 2026-11-25 11:59

Added a search box above the publications list and another above the evidence list. Typing hides rows that do not match. The graph still changes only when a row is selected.

## 2026-11-25 12:01

Added a search box and a multi-select for risks. The option text is the risk id and label. A selection keeps those risks, the evidence passages that mention them, and the publications of those passages. A publication or evidence selection narrows the risk list to the risks on the remaining passages.

## 2026-11-25 12:05

`extract.ipynb` leaves `RISK_ID` 0 and the label `NOT CODED` out of `risk/mentions.csv`. Three rows were dropped: `22.04.00`, `34.03.00`, and `46.03.02`. The source TSVs are unchanged. Rebuilt the JSON from the new mentions: 348 mention rows and 201 risks.
