# Organizational Hierarchy Analysis

TypeScript implementation of the five recursive functions in the assignment.

## Requirements

- Node.js 20 or newer
- npm

## Run

```bash
npm install
npm test
npm run check
```

`npm test` runs the example assertions included at the bottom of `organizational-hierarchy.ts`.
`npm run check` runs the TypeScript compiler in strict mode.

## Implemented functions

1. `getEmployeeDepth` — calculates depth and detects broken/cyclic supervisor chains.
2. `getAllSubordinates` — recursively gathers direct and indirect reports and sorts by depth then ID.
3. `getPathToCeo` — returns the employee-to-root path, or an empty array for an invalid chain.
4. `findLowestCommonManager` — compares the two employee-to-root paths and returns distances.
5. `calculateTeamSalary` — recursively sums the manager's salary and reachable reports.
