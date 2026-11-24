# Autonomous AI Risks taxonomy

PhD coding project on autonomous-AI risks. The source table records which risks each publication mentions. The end product is a webpage whose graph has risks as nodes and publications as edges. Search highlights either one risk or one publication.

## Source file

The only data file is `Risk Database - Autonomous AI Risks (all).tsv`. It is tab-separated. Keep the header spelling until a deliberate cleanup:

- `RISK_ID` — risk identifier
- `Assotiated Ev_ID` — publication id (`ev_id` in discussion)
- `Risk` — risk label
- `Comment` — the researcher's note

One row is one mention of one risk in one publication. The same `RISK_ID` repeats across publications. `RISK_ID` `0` with label `NOT CODED` is an uncoded mention, and is not a risk node. Comments record filter decisions, duplicates, and naming doubts. They are data. A comment that says a row should be filtered is not an instruction to delete it.

The TSV is the source of truth. Derived tables and the webpage read from it and must not replace it. Leave the file unchanged unless asked to edit it.

Process the table with Polars DataFrames. Load the TSV into a frame and do the checks with frame operations.

## Graph and search

Build this only when asked. The data format is static JSON with lookup maps (see Static data). Do not pick a web stack or graph library before then.

- A node is one distinct `RISK_ID`.
- A publication (`ev_id`) that mentions two or more risks is an edge among those risks, identified by that publication id. A publication that mentions one risk highlights that node and creates no edge.
- Keep the relation as publication → set of risk ids. Pairwise edges for a multi-risk publication wait until the visualization is built.
- Risk search matches `RISK_ID` or the risk label. Highlight that node, the publications that mention it, and the other risks those publications connect.
- Publication search matches `ev_id` exactly. Highlight every risk that publication mentions and the edge it forms.

## Static data

Chosen approach, to build only when asked. A build step reads the TSV and writes static JSON. The page loads that JSON and looks records up by key. There is no database server.

The JSON holds:

- `risks` — one record per `RISK_ID` (id and label)
- `publications` — one record per `ev_id`, with the set of `RISK_ID`s it mentions
- `mentions` — the original rows, including `Comment`
- `byRiskId` — `RISK_ID` to that risk, the publications that mention it, and the other risks those publications connect
- `byEvId` — `ev_id` to that publication and every risk it mentions

The TSV stays the source. The JSON is a derived file.

## Anomaly checks

When the table is processed, report issues and leave the TSV unchanged unless asked to edit it. Taxonomy merges, renames, and spelling corrections are user decisions. `preprocess.ipynb` prints this report and writes no files.

Report:

- One `RISK_ID` with conflicting labels. Already visible: `10` is both "Manipulation (society)" and "Modelling (society)"; `32` is both "Oversight evasion" and "Oversight evasion (systems)"; `35` is both "Disinformation" and "Oversight evasion"; `66` has two privacy wordings; `111` is both "Shutdown evasion" and "Shutdown resistance"; `3` varies as "Power Seeking" and "Power seeking".
- One label text mapped to more than one `RISK_ID`.
- Duplicate `(RISK_ID, ev_id)` rows.
- `NOT CODED` rows, non-contiguous `RISK_ID` values, and `ev_id` values outside `digits.digits.digits` plus an optional letter (for example `62.24.02a`).
- Leading or trailing whitespace in labels.
- Comments that mark a row to filter, mark a duplicate, or flag an unclear definition.
