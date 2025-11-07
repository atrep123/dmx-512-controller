# Sample AI task

Goal: update the DMX 512 Controller documentation to describe recent Data Management features.

Constraints:
- keep responses under 400 tokens
- touch only docs/ROADMAP.md and README.md
- add a short changelog entry

Testing:
- run `npm run lint`
- run `npm run test`
- run `pytest server/tests -k "not mqtt"`

Output the exact shell commands you executed and summarize the resulting git diff.
