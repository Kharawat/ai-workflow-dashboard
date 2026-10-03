# Security

## Architecture and boundaries
This local browser tracker stores workflow descriptions in unencrypted localStorage and generates CSV downloads. There is no server, identity system, shared database, active automation/LLM executor or API key. The origin and device are the storage boundary; anyone using the same browser profile or a compromised same-origin app can read it. Keep confidential client data out of public demos.

Stored fields are untrusted: strings/row counts are bounded, enum values allowlisted, identifiers encoded at HTML sinks and invalid numeric values normalized. All formula-leading string cells receive an apostrophe before CSV quoting. Numeric values stay numeric. Spreadsheet software can remove/alter escaping when files are resaved; review externally edited files again. Reset intentionally clears local demo records; export needed data first.

Static CSP restricts scripts and network to own origin; inline style is retained for chart styling, not inline scripts. Hosting must supply HTTPS, nosniff and frame-ancestors (not supported in meta CSP). No cloud/IAM claims can be made from this source. Verify with node --test tests/security.test.mjs.

## Reporting and maintenance
Use GitHub private vulnerability reporting if enabled for this repository, or an already established private maintainer contact. If neither is available, open an issue asking for a private contact without publishing exploit details, customer data or credentials. Never paste a secret into an issue or pull request. Potential historical credentials must be treated as compromised, rotated by the owner and audited before any history rewrite; no rotation or rewrite is automatic.

See [pre-change assessment](docs/security/ASSESSMENT.md) and [verification/review](docs/security/VERIFICATION.md). Source review and offline tests are not production certification. The prepared security workflow (not yet active; see VERIFICATION.md) is read-only, pinned by commit, uses no production credentials and never deploys. Keep action pins and scanners current through reviewed maintenance PRs.
