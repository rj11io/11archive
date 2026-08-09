Avoid a committed central catalog
Do not maintain reports/index.json. Multiple agents will conflict on it.
Instead:
Derive the catalog from each manifest.json during build.
Sort by createdAt.
Generate search/filter metadata automatically.
