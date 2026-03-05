"""Frontend regression smoke for premium UI polish flows.
Covers: dashboard load, create project, builder topbar controls, sidebar interactions, inline edit.
Run manually with Playwright harness.
"""

PLAYWRIGHT_STEPS = [
    "Open public URL from frontend/.env REACT_APP_BACKEND_URL",
    "Verify dashboard loads and create-project form is visible",
    "Create project and verify navigation to /builder/:id",
    "Toggle viewport: desktop/tablet/mobile",
    "Toggle focus mode on/off and verify side panels hide/show",
    "Click save button",
    "Switch sidebar tabs (Library/Pages)",
    "Select another page",
    "Add section from library",
    "Inline edit a section title field",
]
