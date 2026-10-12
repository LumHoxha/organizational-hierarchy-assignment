/** Organizational Hierarchy Analysis — recursive solutions
 * Run with: npx tsx organizational-hierarchy.ts
 */

type NodeRequire = ((id: string) => any) & { main?: unknown };
declare const require: NodeRequire;
declare const module: { main?: unknown };

export interface Employee {
  id: number;
  name: string;
  position: string;
  salary: number;
  supervisor_id: number | null;
}

export interface Subordinate {
  id: number;
  name: string;
  relative_depth: number;
}

export interface CommonManager {
  manager_id: number;
  manager_name: string;
  distance_to_emp1: number;
  distance_to_emp2: number;
}

function indexEmployees(employees: Employee[]): Map<number, Employee> {
  return new Map(employees.map((employee) => [employee.id, employee]));
}

function indexChildren(employees: Employee[]): Map<number, Employee[]> {
  const children = new Map<number, Employee[]>();
  for (const employee of employees) {
    if (employee.supervisor_id === null) continue;
    const reports = children.get(employee.supervisor_id) ?? [];
    reports.push(employee);
    children.set(employee.supervisor_id, reports);
  }
  return children;
}

/** Returns CEO depth (0), or -1 for a missing/broken/cyclic supervisor chain. */
export function getEmployeeDepth(employees: Employee[], employeeId: number): number {
  const byId = indexEmployees(employees);
  const walk = (id: number, visited: Set<number>): number => {
    const employee = byId.get(id);
    if (!employee || visited.has(id)) return -1;
    if (employee.supervisor_id === null) return 0;
    const nextVisited = new Set(visited);
    nextVisited.add(id);
    const supervisorDepth = walk(employee.supervisor_id, nextVisited);
    return supervisorDepth < 0 ? -1 : supervisorDepth + 1;
  };
  return walk(employeeId, new Set<number>());
}

/** Returns all direct and indirect reports, sorted by relative depth then ID. */
export function getAllSubordinates(employees: Employee[], managerId: number): Subordinate[] {
  const byId = indexEmployees(employees);
  if (!byId.has(managerId)) return [];
  const children = indexChildren(employees);
  const result: Subordinate[] = [];

  const walk = (id: number, depth: number, visited: Set<number>): void => {
    if (visited.has(id)) return;
    const nextVisited = new Set(visited);
    nextVisited.add(id);
    for (const child of children.get(id) ?? []) {
      if (nextVisited.has(child.id)) continue;
      result.push({ id: child.id, name: child.name, relative_depth: depth });
      walk(child.id, depth + 1, nextVisited);
    }
  };

  walk(managerId, 1, new Set<number>());
  return result.sort((a, b) => a.relative_depth - b.relative_depth || a.id - b.id);
}

/** Returns employee-to-root IDs, or [] for missing/broken/cyclic chains. */
export function getPathToCeo(employees: Employee[], employeeId: number): number[] {
  const byId = indexEmployees(employees);
  const walk = (id: number, visited: Set<number>): number[] => {
    const employee = byId.get(id);
    if (!employee || visited.has(id)) return [];
    if (employee.supervisor_id === null) return [employee.id];
    const nextVisited = new Set(visited);
    nextVisited.add(id);
    const parentPath = walk(employee.supervisor_id, nextVisited);
    return parentPath.length === 0 ? [] : [employee.id, ...parentPath];
  };
  return walk(employeeId, new Set<number>());
}

/** Finds the deepest common manager using each employee's path exactly once. */
export function findLowestCommonManager(
  employees: Employee[],
  empId1: number,
  empId2: number,
): CommonManager | null {
  const byId = indexEmployees(employees);
  if (!byId.has(empId1) || !byId.has(empId2)) return null;

  const path1 = getPathToCeo(employees, empId1);
  const path2 = getPathToCeo(employees, empId2);
  if (path1.length === 0 || path2.length === 0) return null;

  const positions2 = new Map<number, number>();
  path2.forEach((id, index) => positions2.set(id, index));
  for (let i = 0; i < path1.length; i++) {
    const commonId = path1[i];
    const j = positions2.get(commonId);
    if (j !== undefined) {
      const manager = byId.get(commonId)!;
      return {
        manager_id: commonId,
        manager_name: manager.name,
        distance_to_emp1: i,
        distance_to_emp2: j,
      };
    }
  }
  return null;
}

/** Sums a manager's own salary plus every reachable subordinate's salary. */
export function calculateTeamSalary(employees: Employee[], managerId: number): number {
  const byId = indexEmployees(employees);
  if (!byId.has(managerId)) return 0;
  const children = indexChildren(employees);

  const walk = (id: number, visited: Set<number>): number => {
    const employee = byId.get(id);
    if (!employee || visited.has(id)) return 0;
    const nextVisited = new Set(visited);
    nextVisited.add(id);
    return employee.salary + (children.get(id) ?? []).reduce(
      (sum, child) => sum + walk(child.id, nextVisited),
      0,
    );
  };

  return walk(managerId, new Set<number>());
}

// Dataset from the assignment, included for quick local verification.
export const employees: Employee[] = [
  { id: 1, name: "Alice Johnson", position: "CEO", salary: 250000, supervisor_id: null },
  { id: 2, name: "Bob Smith", position: "CTO", salary: 180000, supervisor_id: 1 },
  { id: 3, name: "Carol White", position: "CFO", salary: 175000, supervisor_id: 1 },
  { id: 4, name: "David Brown", position: "Engineering Manager", salary: 140000, supervisor_id: 2 },
  { id: 5, name: "Eve Davis", position: "QA Manager", salary: 130000, supervisor_id: 2 },
  { id: 6, name: "Frank Wilson", position: "Senior Accountant", salary: 95000, supervisor_id: 3 },
  { id: 7, name: "Grace Lee", position: "Senior Developer", salary: 120000, supervisor_id: 4 },
  { id: 8, name: "Henry Martinez", position: "Junior Developer", salary: 85000, supervisor_id: 4 },
  { id: 9, name: "Ivy Chen", position: "QA Engineer", salary: 90000, supervisor_id: 5 },
  { id: 10, name: "Jack Thompson", position: "DevOps Engineer", salary: 110000, supervisor_id: 4 },
  { id: 11, name: "Kelly Anderson", position: "Junior Accountant", salary: 65000, supervisor_id: 6 },
  { id: 12, name: "Liam Garcia", position: "Intern Developer", salary: 50000, supervisor_id: 7 },
];

// Lightweight checks against the assignment's examples.
if (typeof require !== "undefined" && require.main === module) {
  const assert = require("node:assert/strict");
  assert.equal(getEmployeeDepth(employees, 1), 0);
  assert.equal(getEmployeeDepth(employees, 12), 4);
  assert.equal(getEmployeeDepth(employees, 999), -1);
  assert.deepEqual(getPathToCeo(employees, 12), [12, 7, 4, 2, 1]);
  assert.deepEqual(getPathToCeo(employees, 1), [1]);
  assert.deepEqual(getPathToCeo(employees, 999), []);
  assert.deepEqual(getAllSubordinates(employees, 6), [
    { id: 11, name: "Kelly Anderson", relative_depth: 1 },
  ]);
  assert.deepEqual(findLowestCommonManager(employees, 8, 10), {
    manager_id: 4, manager_name: "David Brown", distance_to_emp1: 1, distance_to_emp2: 1,
  });
  assert.equal(calculateTeamSalary(employees, 1), 1490000);
  assert.equal(calculateTeamSalary(employees, 4), 505000);
  assert.equal(calculateTeamSalary(employees, 999), 0);
  console.log("All assignment example checks passed.");
}
