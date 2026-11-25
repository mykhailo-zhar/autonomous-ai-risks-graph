# autonomous-ai-risks-graph

[![code: MIT](https://img.shields.io/badge/code-MIT-blue)](LICENSE)
[![source data: CC BY 4.0](https://img.shields.io/badge/source%20data-CC%20BY%204.0-lightgrey)](https://creativecommons.org/licenses/by/4.0/)

A graph of autonomous-AI risks. Each node is a risk, and its size is how often that risk is coded. An edge is an evidence passage that names two or more risks.

From the repository root:

```bash
python3 -m http.server
```

Then open `/src/`.

## Changes from the MIT AI Risk Repository

This project uses the repository's database and changes it in three ways:

- It keeps the risks the repository codes as intentional.
- It splits those entries into more granular risks.
- It classifies the granular risks in this project's own taxonomy.

MIT and the repository's authors do not endorse this taxonomy.

## Attribution

The source database is the MIT AI Risk Repository, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Slattery, P., Saeri, A. K., Grundy, E. A. C., Graham, J., Noetel, M., Uuk, R., Dao, J., Pour, S., Casper, S., and Thompson, N. (2024). *The AI Risk Repository: A Comprehensive Meta-Review, Database, and Taxonomy of Risks from Artificial Intelligence.* https://doi.org/10.48550/arXiv.2408.12622

The database is at https://airisk.mit.edu/ and deposited at https://doi.org/10.17605/OSF.IO/CET8G.

The tables and JSON derived from that database stay under CC BY 4.0. The MIT license covers the code in this repository. It does not replace the attribution above.
