# 🚀 Linear Board Setup Guide - Patient Portal Automation

## 📋 Overview
This guide will help you set up your Linear board for the Patient Portal Automation project.

---

## 🎯 Quick Start (3 Methods)

### **Method 1: CSV Import (Fastest - 5 minutes)**
1. Go to your Linear workspace
2. Click **Settings** → **Import & Export** → **Import issues**
3. Upload `LINEAR_IMPORT.csv`
4. Map columns:
   - Title → Title
   - Description → Description
   - Priority → Priority
   - Estimate → Estimate
   - Epic → Parent
   - Status → Status
   - Type → Issue Type
5. Click **Import**
6. Done! ✅

### **Method 2: Manual Creation (Using the detailed doc)**
1. Open `PATIENT_PORTAL_EPICS.md`
2. Create each Epic in Linear (11 epics total)
3. Create User Stories under each Epic
4. Copy acceptance criteria and test scenarios
5. Set priorities and estimates

### **Method 3: Linear API (For automation)**
Use the Linear API to programmatically create all issues.

---

## 📊 Linear Board Structure

```
Patient Portal Automation (Project)
│
├── 🎯 Epic 1: Authentication & Account Management
│   ├── Story: Patient Registration
│   ├── Story: Patient Login
│   ├── Story: Password Reset
│   └── Story: Two-Factor Authentication
│
├── 🎯 Epic 2: Patient Profile Management
│   ├── Story: View Profile Information
│   ├── Story: Update Profile Information
│   └── Story: Upload Profile Photo
│
├── 🎯 Epic 3: Appointment Management
│   ├── Story: View Appointments
│   ├── Story: Schedule New Appointment
│   ├── Story: Cancel/Reschedule Appointment
│   └── Story: Virtual Visit (Telehealth)
│
... (8 more epics)
```

---

## 🏷️ Labels & Tags to Create

### **Priority Labels:**
- 🔴 **High** - Must have for MVP
- 🟡 **Medium** - Should have soon
- 🟢 **Low** - Nice to have

### **Component Labels:**
- `frontend` - UI/UX testing
- `backend` - API testing
- `mobile` - Mobile app testing
- `integration` - End-to-end testing
- `accessibility` - WCAG compliance
- `security` - HIPAA/Security testing

### **Type Labels:**
- `smoke-test` - Critical path tests
- `regression` - Full regression suite
- `exploratory` - Manual exploratory testing
- `performance` - Load/performance testing

### **Browser Labels:**
- `chrome`
- `firefox`
- `safari`
- `edge`

### **Device Labels:**
- `desktop`
- `tablet`
- `mobile`

---

## 🔄 Workflow States

Set up these states in Linear:

1. **Backlog** - Not started
2. **Todo** - Ready to start
3. **In Progress** - Actively working on it
4. **In Review** - Code review / QA review
5. **Testing** - Running tests
6. **Blocked** - Waiting on something
7. **Done** - Completed and verified
8. **Cancelled** - No longer needed

---

## 📈 Story Point Scale

Use this scale for estimates:

- **1 point** - 1-2 hours (simple test, single scenario)
- **2 points** - 2-4 hours (moderate complexity)
- **3 points** - 4-6 hours (multiple scenarios)
- **5 points** - 1-2 days (complex feature, many test cases)
- **8 points** - 2-3 days (very complex, integration testing)
- **13 points** - 1 week (break this down further!)

---

## 👥 Team Roles

Assign team members to these roles:

- **QA Lead** - Overall test strategy and planning
- **Automation Engineers** - Writing and maintaining tests
- **Manual Testers** - Exploratory and edge case testing
- **Accessibility Specialist** - WCAG compliance testing
- **Security Tester** - HIPAA and security testing

---

## 📅 Sprint Planning Guide

### **Sprint 1 (2 weeks) - Foundation**
**Goal:** Set up test framework and authentication tests

**Stories to include:**
- [ ] Patient Registration (5 points)
- [ ] Patient Login (5 points)
- [ ] Password Reset (3 points)
- [ ] Test framework setup (3 points)

**Total:** ~16 points

---

### **Sprint 2 (2 weeks) - Profile & Appointments**
**Goal:** Core user features

**Stories to include:**
- [ ] View Profile Information (3 points)
- [ ] Update Profile Information (5 points)
- [ ] View Appointments (5 points)

**Total:** ~13 points

---

### **Sprint 3 (2 weeks) - Appointment Booking**
**Goal:** Critical appointment features

**Stories to include:**
- [ ] Schedule New Appointment (8 points)
- [ ] Virtual Visit (8 points)

**Total:** ~16 points

---

### **Sprint 4 (2 weeks) - Medical Records**
**Goal:** Access to health information

**Stories to include:**
- [ ] View Lab Results (5 points)
- [ ] View Medications (5 points)
- [ ] View Visit Summaries (3 points)

**Total:** ~13 points

---

### **Sprint 5 (2 weeks) - Billing**
**Goal:** Payment functionality

**Stories to include:**
- [ ] View Bills and Statements (5 points)
- [ ] Make a Payment (8 points)

**Total:** ~13 points

---

### **Sprint 6 (2 weeks) - Compliance**
**Goal:** Accessibility and security

**Stories to include:**
- [ ] WCAG 2.1 AA Compliance (8 points)
- [ ] HIPAA Compliance (8 points)

**Total:** ~16 points

---

## 🎯 Milestones to Create

### **Milestone 1: MVP (End of Sprint 3)**
- Authentication working
- Profile management working
- Appointments can be viewed and scheduled
- **Success Criteria:** 80% test coverage for these features

### **Milestone 2: Core Features Complete (End of Sprint 5)**
- Medical records accessible
- Billing and payments working
- **Success Criteria:** 85% test coverage

### **Milestone 3: Production Ready (End of Sprint 6)**
- All compliance requirements met
- Mobile app tested
- **Success Criteria:** 90% test coverage, zero critical bugs

---

## 📊 Custom Views to Create

### **View 1: Current Sprint**
- **Filter:** Status = "In Progress" OR Status = "Todo"
- **Sort by:** Priority (High → Low)
- **Group by:** Assignee

### **View 2: Blocked Items**
- **Filter:** Status = "Blocked"
- **Sort by:** Created date (oldest first)
- **Group by:** Epic

### **View 3: High Priority**
- **Filter:** Priority = "High" AND Status ≠ "Done"
- **Sort by:** Epic
- **Group by:** Status

### **View 4: Test Coverage Dashboard**
- **Filter:** All issues
- **Group by:** Epic
- **Show:** Progress bars for each epic

### **View 5: This Week**
- **Filter:** Due date = This week
- **Sort by:** Due date
- **Group by:** Priority

---

## 🔗 Integrations to Set Up

### **GitHub Integration**
Connect Linear to your GitHub repo:
1. Settings → Integrations → GitHub
2. Authorize Linear
3. Select repository: `Lumimeds-Automation-Tests`
4. Use format: `LUM-123` in commit messages to link
5. PRs will automatically link to Linear issues

### **Slack Integration**
Get updates in Slack:
1. Settings → Integrations → Slack
2. Select Slack channel: `#qa-automation`
3. Configure notifications for:
   - Issue status changes
   - New comments on watched issues
   - Issues assigned to you
   - Sprint starts/ends

### **Playwright Reports**
Link test results to Linear issues:
- Add Linear issue ID to test names
- Parse test results and comment on Linear issues
- Auto-update issue status based on test results

---

## 📝 Issue Templates to Create

### **Template 1: User Story**
```markdown
## User Story
As a [user type]
I want to [action]
So that [benefit]

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3

## Test Scenarios
1. Scenario 1
2. Scenario 2
3. Scenario 3

## Test Data
- User accounts needed
- Test data requirements

## Notes
- Additional context
- Dependencies
- Related issues
```

### **Template 2: Bug Report**
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Result
What should happen

## Actual Result
What actually happens

## Environment
- Browser: 
- Device: 
- OS: 
- Build: 

## Screenshots/Videos
[Attach here]

## Severity
- [ ] Critical (Production down)
- [ ] High (Major functionality broken)
- [ ] Medium (Feature impaired)
- [ ] Low (Minor issue)
```

### **Template 3: Test Case**
```markdown
## Test Objective
What are we testing?

## Preconditions
- Precondition 1
- Precondition 2

## Test Steps
1. Step 1
2. Step 2
3. Step 3

## Expected Results
- Expected result 1
- Expected result 2

## Actual Results
[To be filled during testing]

## Test Data
- Data required

## Pass/Fail
- [ ] Pass
- [ ] Fail

## Notes
```

---

## 🎨 Linear Workspace Settings

### **Recommended Settings:**

**Project Settings:**
- **Default view:** Grouped by Status
- **Default issue type:** Story
- **Auto-close issues:** When PR is merged
- **Auto-archive:** After 2 weeks in Done

**Notification Settings:**
- Notify on: Assignment, Status change, Comments
- Digest: Daily at 9 AM
- Do Not Disturb: Weekends

**Workflow Automation:**
- When status → In Review, require assignee
- When status → Done, require comment
- Auto-assign to creator when moved to Testing

---

## 📊 Metrics & Reporting

### **Key Metrics to Track:**

1. **Velocity**
   - Points completed per sprint
   - Target: 60-70 points per sprint (4-person team)

2. **Test Coverage**
   - % of user stories with automated tests
   - Target: >85%

3. **Bug Escape Rate**
   - Bugs found in production vs staging
   - Target: <5% escape rate

4. **Cycle Time**
   - Time from Todo → Done
   - Target: <3 days average

5. **Test Pass Rate**
   - % of tests passing in CI/CD
   - Target: >95%

### **Weekly Reports to Generate:**
- Sprint progress report
- Test coverage by epic
- Blocker analysis
- Velocity trend

---

## 🚀 Getting Started Checklist

- [ ] Import CSV or create epics manually
- [ ] Create all labels and tags
- [ ] Set up workflow states
- [ ] Create custom views
- [ ] Set up GitHub integration
- [ ] Set up Slack integration
- [ ] Create issue templates
- [ ] Configure notifications
- [ ] Plan Sprint 1
- [ ] Assign team members
- [ ] Set up milestones
- [ ] Schedule sprint planning meeting
- [ ] Schedule daily standups
- [ ] Schedule sprint review/retro

---

## 💡 Pro Tips

1. **Keep stories small** - Aim for 3-5 points max
2. **Write clear acceptance criteria** - "Given/When/Then" format works well
3. **Link related issues** - Use "Blocks", "Relates to", "Duplicates"
4. **Use sub-issues** - For complex stories, break into sub-tasks
5. **Update regularly** - Keep issue status current
6. **Comment frequently** - Document decisions and blockers
7. **Review and refine** - Groom backlog weekly
8. **Celebrate wins** - Mark milestones in Slack

---

## 📞 Support & Resources

- **Linear Documentation:** https://linear.app/docs
- **Linear API:** https://developers.linear.app
- **Playwright Docs:** https://playwright.dev
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **HIPAA Resources:** https://www.hhs.gov/hipaa

---

**Created:** January 2026  
**Last Updated:** January 2026  
**Maintained by:** QA Automation Team

