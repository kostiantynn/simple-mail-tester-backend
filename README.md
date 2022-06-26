# Simple Email Verification <!-- omit in toc -->

Verification tool made like API with functionality to:
- Create Mailbox
- Delete Mailbox
- Analyze Mailbox

## Tech stack
- Node
- Fastify
- Typescript

## Validation Steps
- RDNS
<br/>&nbsp; For RDNS Validation the `reverse` method from `DNS` module was used.
- SPF
<br/>&nbsp; For SPF Validation the `resolveTXT` method from `DNS` module was used.
- DKIM
<br/>&nbsp; DKIM Validation took the next steps to validate
    - Parse mail using Custom Mail Parser
    - Validate if `DKIM-Signature` headers exists
    - Using `DKIM-Signature` headers to create body for future verification
    - Make DNS Query using `resolveTXT` to get PublicKey
    - Use PublicKey to verify body and compare it with buffer from `DKIM-Signature`
- DMARC
<br/>&nbsp; Make a dns query using `resolveTXT` method and validate for:
    - Policy
    - Reports
