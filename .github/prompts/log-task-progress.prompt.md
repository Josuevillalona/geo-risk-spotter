---
mode: 'ask'
description: 'Generate a progress log entry for cline_docs/progress-log.md'
---
Generate a progress log entry for `cline_docs/progress-log.md`.

Ask for:
- Task name
- Date
- Objective
- Approach
- Implementation details
- Tests/Validation performed
- Status (In Progress, Complete, Blocked)
- Next steps

Format the entry as follows:

```
## [DATE] - [TASK NAME]

### Objective
What we're trying to accomplish

### Approach
How we plan to solve it

### Implementation
What was actually done

### Tests/Validation
How we verified it works

### Status
- [ ] In Progress
- [x] Complete
- [ ] Blocked (reason)

### Next Steps
What comes next
```

Apply guidelines from [Documentation Requirements Guidelines](../../.clinerules/05-documentation-reqs.md).
