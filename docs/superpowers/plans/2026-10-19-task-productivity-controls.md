# Task Productivity Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add safe task/subtask duplication, stage-level subtask collapsing, parent-assignee reuse, list-row quick subtask creation, and notification navigation that reveals the target task.

**Architecture:** Keep `Tasks` as the operation orchestrator, move duplication rules and Appwrite copying into a focused service, and keep visual-only state in `ClickUpTaskList`/`SubtaskDialog`. Add small pure helpers for collection state transitions so core rules can be tested independently, then cover UI wiring with React Testing Library.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, React Testing Library, Radix/shadcn, Appwrite Web SDK.

**Spec:** `docs/superpowers/specs/2026-10-19-task-productivity-controls-design.md`

## Global Constraints

- Every duplicated task and child starts in `Planning`.
- Title is always copied with `(Copy)` for direct duplication; comments, activities, and `completed_at` are never copied.
- Copy options are description, assignees, due date, task type, attachments, and all direct subtasks.
- Priority is always `Normal`; an unselected task type defaults to `Primary`.
- Attachment copies must have independent storage files and metadata records.
- Quick-create remains unobtrusive on pointer devices but accessible by keyboard and touch.
- `My task` is disabled only for task navigation explicitly marked as coming from a notification.

## Review Focus

- Repeated submit/click during duplication creates exactly one root copy; covered by the dialog/service tests in Task 1.
- Partial attachment/subtask failure preserves the root result and reports accurate failure counts; covered by Task 1 service tests.
- Empty parent-assignee lists do not render a misleading reuse action; covered by Task 2 component tests.
- Filtered stages only collapse task rows currently represented in that stage; covered by Task 3 helper/component tests.
- A direct task URL without `source=notification` does not override the user's `My task` state; covered by Task 4 navigation tests.

---

### Task 1: Duplication Rules, Service, and Confirmation Dialog

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/services/taskDuplicationService.ts`
- Create: `src/services/taskDuplicationService.test.ts`
- Create: `src/components/tasks/DuplicateTaskDialog.tsx`
- Create: `src/components/tasks/DuplicateTaskDialog.test.tsx`
- Modify: `src/components/tasks/TaskDetailSidebar.tsx`
- Modify: `src/pages/Tasks.tsx`

**Interfaces:**
- Produces: `DuplicateTaskOptions`, `DuplicateTaskResult`, and `duplicateTaskTree(source: TaskWithRelations, options: DuplicateTaskOptions, userId: string): Promise<DuplicateTaskResult>`.
- Produces: `DuplicateTaskDialog` props `{ task, open, onOpenChange, onConfirm, isDuplicating }`.
- Produces: `TaskDetailSidebar.onDuplicateTask?: (task: TaskWithRelations) => void`.

- [ ] **Step 1: Add the test runner in the same change that needs it**

Add Vitest, jsdom, React Testing Library, jest-dom, and user-event as dev dependencies; add `test` and `test:run` scripts; configure the `@` alias, jsdom environment, and `src/test/setup.ts` in Vite/Vitest config.

- [ ] **Step 2: Write failing service tests**

Cover direct task payload defaults, selected/omitted fields, direct subtask title suffix, parent-with-children title preservation, all statuses becoming `Planning`, comments/activity/completion exclusion, independent attachment upload metadata, duplicate-submit-safe orchestration, and partial child/attachment failure counts.

- [ ] **Step 3: Run service tests and verify RED**

Run: `npm run test:run -- src/services/taskDuplicationService.test.ts`

Expected: FAIL because the service and exported interfaces do not exist.

- [ ] **Step 4: Implement the minimal duplication service**

Use Appwrite `databases`/`storage`, extract source file IDs, fetch each source binary, upload a new `File`, create new attachment metadata, map child `parent_task_id` to the new root, and return `{ taskId, failedSubtasks, failedAttachments }` without copying comments or activities.

- [ ] **Step 5: Run service tests and verify GREEN**

Run: `npm run test:run -- src/services/taskDuplicationService.test.ts`

Expected: PASS.

- [ ] **Step 6: Write failing dialog and sidebar integration tests**

Assert all relevant checkboxes default checked, comments are shown as excluded, `All subtasks` is conditional, submit is disabled while duplicating, repeated submit calls once, and both task/subtask detail menus expose `Duplicate`.

- [ ] **Step 7: Run component tests and verify RED**

Run: `npm run test:run -- src/components/tasks/DuplicateTaskDialog.test.tsx`

Expected: FAIL because the dialog and sidebar callback are not implemented.

- [ ] **Step 8: Implement dialog and `Tasks` orchestration**

Add duplicate selection/loading state, call `duplicateTaskTree`, invalidate task data, select the returned copy after refresh, and show destructive, warning, or success toast according to the result.

- [ ] **Step 9: Run Task 1 tests and commit**

Run: `npm run test:run -- src/services/taskDuplicationService.test.ts src/components/tasks/DuplicateTaskDialog.test.tsx`

Expected: PASS.

Commit: `feat: add task and subtask duplication`

### Task 2: Parent Assignee Reuse and List Quick-Create

**Files:**
- Create: `src/components/tasks/subtaskAssignees.ts`
- Create: `src/components/tasks/subtaskAssignees.test.ts`
- Modify: `src/components/tasks/SubtaskDialog.tsx`
- Create: `src/components/tasks/SubtaskDialog.test.tsx`
- Modify: `src/components/tasks/ClickUpTaskList.tsx`
- Create: `src/components/tasks/ClickUpTaskList.test.tsx`
- Modify: `src/pages/Tasks.tsx`

**Interfaces:**
- Produces: `mergeAssigneeIds(current: string[], inherited: string[]): string[]`.
- Updates: `SubtaskDialog.parentAssignees?: string[]`.
- Updates: `ClickUpTaskList.onAddSubtask: (taskId: string) => void`.

- [ ] **Step 1: Write failing assignee helper/form tests**

Assert stable union order, duplicate removal, manual selection preservation, hidden action for no parent assignees, `Use parent team · N` placement beside the Assignees label, and `Parent team added` state.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test:run -- src/components/tasks/subtaskAssignees.test.ts src/components/tasks/SubtaskDialog.test.tsx`

Expected: FAIL because the helper/prop/action do not exist.

- [ ] **Step 3: Implement assignee reuse**

Add the pure union helper, pass parent assignees from `Tasks`, and update the form field through `form.setValue('assignees', ..., { shouldDirty: true })`.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npm run test:run -- src/components/tasks/subtaskAssignees.test.ts src/components/tasks/SubtaskDialog.test.tsx`

Expected: PASS.

- [ ] **Step 5: Write failing quick-create tests**

Assert the action exists only on parent rows, uses hover/focus/touch-safe classes, stops row selection, and calls `onAddSubtask` with the correct task ID.

- [ ] **Step 6: Run quick-create tests and verify RED**

Run: `npm run test:run -- src/components/tasks/ClickUpTaskList.test.tsx`

Expected: FAIL because `onAddSubtask` and the row action are missing.

- [ ] **Step 7: Implement quick-create and wire `Tasks`**

Place the small plus action after title/count, use `group-hover` and `group-focus-within`, keep it visible on non-hover viewports, and open the existing Subtask dialog for that parent.

- [ ] **Step 8: Run Task 2 tests and commit**

Run: `npm run test:run -- src/components/tasks/subtaskAssignees.test.ts src/components/tasks/SubtaskDialog.test.tsx src/components/tasks/ClickUpTaskList.test.tsx`

Expected: PASS.

Commit: `feat: streamline subtask creation`

### Task 3: Stage-Level Collapse/Expand of Subtasks

**Files:**
- Create: `src/components/tasks/taskListCollapse.ts`
- Create: `src/components/tasks/taskListCollapse.test.ts`
- Modify: `src/components/tasks/ClickUpTaskList.tsx`
- Modify: `src/components/tasks/ClickUpTaskList.test.tsx`

**Interfaces:**
- Produces: `toggleStageSubtasks(collapsed: Set<string>, stageTasks: TaskWithRelations[]): Set<string>`.
- Produces: `areAllStageSubtasksCollapsed(collapsed: Set<string>, stageTasks: TaskWithRelations[]): boolean`.

- [ ] **Step 1: Write failing helper/component tests**

Assert only parent IDs with subtasks are added/removed, unrelated stage IDs remain unchanged, empty stages do nothing, and the header action switches between `Collapse subtasks` and `Expand subtasks` without triggering the existing whole-stage collapse.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test:run -- src/components/tasks/taskListCollapse.test.ts src/components/tasks/ClickUpTaskList.test.tsx`

Expected: FAIL because helpers/header action do not exist.

- [ ] **Step 3: Implement stage toggle and header action**

Derive IDs from the currently rendered `statusTasks`, update the existing `collapsedSubtasks` set immutably, and keep the existing group chevron behavior untouched.

- [ ] **Step 4: Run Task 3 tests and commit**

Run: `npm run test:run -- src/components/tasks/taskListCollapse.test.ts src/components/tasks/ClickUpTaskList.test.tsx`

Expected: PASS.

Commit: `feat: toggle all subtasks within a stage`

### Task 4: Notification Navigation Reveals Target Task

**Files:**
- Modify: `src/services/notificationService.ts`
- Create: `src/services/notificationService.test.ts`
- Create: `src/pages/taskNavigation.ts`
- Create: `src/pages/taskNavigation.test.ts`
- Modify: `src/pages/Tasks.tsx`

**Interfaces:**
- Updates: `getNotificationDestination(data)` to emit `source=notification` for task destinations.
- Produces: `isNotificationTaskNavigation(params: URLSearchParams): boolean`.

- [ ] **Step 1: Write failing navigation tests**

Assert task notifications include `source=notification`; project-only destinations do not; marked task navigation disables `My task`; unmarked task URLs and plain `/tasks` do not override it.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test:run -- src/services/notificationService.test.ts src/pages/taskNavigation.test.ts`

Expected: FAIL because the marker/helper are missing.

- [ ] **Step 3: Implement the marker and consume it in `Tasks`**

Set `myTasksOnly(false)` when both `taskId` and `source=notification` exist before selecting the task; keep project selection and detail auto-open behavior unchanged.

- [ ] **Step 4: Run Task 4 tests and commit**

Run: `npm run test:run -- src/services/notificationService.test.ts src/pages/taskNavigation.test.ts`

Expected: PASS.

Commit: `fix: reveal tasks opened from notifications`

### Task 5: Regression and Production Verification

**Files:**
- Modify only files required by failures attributable to Tasks 1–4.

**Interfaces:**
- Consumes all interfaces from Tasks 1–4.
- Produces a verified build with no known task-feature regressions.

- [ ] **Step 1: Run the complete automated test suite**

Run: `npm run test:run`

Expected: all tests PASS with no unhandled errors or warnings.

- [ ] **Step 2: Run static checks and production build**

Run: `npm run lint`

Run: `npm run build`

Expected: both exit 0; report any pre-existing unrelated failures by exact command and message.

- [ ] **Step 3: Review the final diff against the spec**

Verify comments/activity exclusion, Planning status, independent files, hover/focus behavior, stage isolation, and notification-only My task override.

- [ ] **Step 4: Commit final verification fixes if needed**

Commit: `chore: verify task productivity controls`
