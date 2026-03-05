# PRD — Creative Studio Builder

## Original Problem Statement
I would like to create a drag and drop website builder tool. This will allow users to drag in from a libary different section based designs, such as header, hero, call to actions, contact us, footers, testimonials, blogs, logos and a lot lot more.
I would like an easy way that the user can click on one, add to page. Simple.
The goal will be to get a website built quickly.

i want good frontened and good user experience

### User Choices
- V1 scope: Multi-page website builder
- Add flow: Both click-to-add and drag-and-drop
- Editing controls: Reorder, duplicate, delete sections + edit content + style controls
- Save preference: Save projects to database
- Design direction: Bold modern creative

## Architecture Decisions
- Frontend: React app with routed auth page (`/auth`), protected dashboard (`/dashboard`), and protected builder workspace (`/builder/:projectId`)
- Backend: FastAPI auth + website builder API using MongoDB
- Data model: Project → Pages → Sections, with flexible JSON content/styles per section
- Auth model: user accounts with email/password, JWT session tokens, and owner-scoped project access
- UX pattern: Dark builder cockpit + light website canvas, with left library, center canvas, right properties panel
- Drag/drop: `@dnd-kit` for library-to-canvas insertion and sortable section reordering

## What’s Implemented
- Premium auth entry experience with real signup/login flow, protected routes, session restore, and sign-out
- Auth page refined into a centered, cleaner premium experience so login/signup is the clear focal point instead of a collage-style layout
- Added a curated image-driven theme wall below auth using both selected and generated visuals, inspired by the reference collage but simplified into a cleaner premium grid
- Replaced the auth-page blur-heavy color background with a translucent premium image backdrop based on the provided reference so the login screen feels cleaner and more refined
- Refined the auth showcase into web-first desktop preview cards so the lower gallery feels like curated website themes instead of mobile/photo tiles
- Dashboard background cleaned to a consistent near-black surface with the blur/glow field removed for a sharper premium feel
- Project dashboard with starter project creation, saved project listing, and delete flow
- Multi-page builder with section library, click-to-add, drag-and-drop add, drag reorder, duplicate, and delete
- Right-side content/style editing plus direct inline canvas editing for visible website text (headlines, paragraphs, nav items, buttons, lists, contact details, FAQ content, footer text)
- Quick component color decision flow: select a section or sub-component from the canvas and use a compact floating color toolbar to recolor only that target
- Premium UI polish pass across the existing layout: refined typography hierarchy, increased whitespace, richer glassmorphism panels, stronger depth/shadows, radial background glows, and smoother motion/micro-interactions
- Viewport toggles, focus mode, and save-to-database persistence
- FastAPI auth endpoints plus owner-scoped project CRUD stored in MongoDB
- Runtime toast crash fix: global `sonner` toaster is mounted in app shell and auth/dashboard/builder toast flows now render safely without app crashes
- Stability verification pass completed across auth → dashboard → builder (toast validation, project create/open/save, API auth/project endpoints)
- Builder canvas control UX cleanup: section action controls are now hover/selection-revealed (not always visible), with cleaner motion and reduced visual noise
- Builder control readability fix: move/duplicate/delete actions now use higher-contrast styling in dark control surface
- Color safety logic added to style editing: unreadable text/background combinations auto-correct to maintain readable contrast
- Sidebar UI refinement pass (Library + Pages): cleaner tab strip, less visual clutter, improved spacing hierarchy, and safer layout boundaries to avoid overlap/mixed content
- Library cards refined for cleaner dark UI (compact drag handle, clearer category label, simplified card/action styling)
- Pages list overflow hardening: long page names/slugs are truncated cleanly with no row overflow beyond sidebar bounds
- Auth hero copy refinement: heading updated to “Website builder.” for cleaner, minimal brand presentation
- Sticky builder sidebars implemented for long projects: left Library+Pages panel and right Properties panel now remain pinned while scrolling
- Sticky reliability fix: builder workspace overflow context updated to allow `position: sticky` to work correctly (`builder-shell-workspace`)
- Brand identity pass on auth page: generated and integrated a classic "Website builder." logo, displayed above auth heading for premium presentation
- Builder topbar branding cleanup: replaced legacy text label with logo-first identity block for a cleaner and more premium header
- Dashboard aesthetic redesign: cleaner structure with brand-led hero/create panel, dedicated metrics strip positioned above project list, and project rows converted into cleaner list-style cards
- Dashboard UX update requested by user completed: key numbers moved into top metrics panel and projects now presented in organized list-first format
- Builder toolbar UI issue fix: quick color toolbar redesigned with dark high-contrast surface and readable controls/text on light canvas
- Section style contrast hardening: right-panel style edits now auto-correct text color when users choose low-contrast text/background combinations
- Section render fallback hardening: existing sections with poor saved color combos now render with readable text colors automatically
- Repo showcase documentation added: root README now includes “Built with Emergent + GPT-5.4”, representative prompts, before/after UI snapshots, and a short timelapse artifact
- README formatting cleanup: removed bold-heavy markdown styling from attribution/showcase copy to keep documentation plain and clean
- README image-link compatibility pass: showcase image paths normalized to repo folder links (`showcase/...`) for GitHub README rendering

## Prioritized Backlog
### P0
- ✅ Fix runtime toast crash (`toast.error` undefined flow) — completed and verified
- Add per-page publish/export flow for generated websites
- Add undo/redo history for builder actions
- Add inline image editing / image replacement flow inside sections
- Add password recovery / account management flow

### P1
- ✅ Builder canvas control cleanup: hover-first section controls implemented
- ✅ Color readability logic: auto-correct unreadable text color combinations implemented
- ✅ Library + Pages sidebar tabs redesigned to cleaner, simpler, non-overlapping UI
- ✅ Left + right builder sidebars now sticky on desktop for long-canvas workflows
- Add more section presets and category filters
- Add page duplication and page reordering
- Add autosave status + optimistic save indicator
- Refactor large section renderer into smaller visual modules for safer future design iterations

### P2
- ✅ Dashboard project redesign completed (clean aesthetic + numbers moved above project list)
- Add theme presets and reusable global style tokens
- Add collaboration/sharing workflow
- Add SEO/settings panel expansion and image/media uploads

## Next Tasks
1. Add export/publish flow so built sites can be turned into launch-ready outputs
2. Introduce undo/redo + stronger autosave feedback for safer long editing sessions
3. Continue builder refactor (split large `SectionRenderer` into smaller section components)
4. Add inline image/media editing controls inside section editing workflows

## Latest Verification (2026-03-05)
- Frontend smoke + flow checks passed on preview URL:
  - Auth validation toast appears without runtime crash
  - Invalid login toast appears without runtime crash
  - Login/signup redirect and protected routes function correctly
  - Dashboard create/open project and builder save flow work end-to-end
- Backend API checks passed via curl:
  - `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/website-builder/projects`
- Note: No mocked API flows used.
- Additional validation: testing agent report `/app/test_reports/iteration_8.json` confirms hover control behavior, contrast/readability fixes, and auth→dashboard→builder regression flow all PASS.
- Additional validation: testing agent report `/app/test_reports/iteration_9.json` confirms redesigned sidebar tabs and library/pages UI are clean/non-overlapping with functional tab switching and page creation.
- Follow-up fix applied after iteration_9 LOW note: long page-name row overflow addressed; self-test confirms no horizontal overflow in page rows.
- Sticky sidebar verification: testing agent report `/app/test_reports/iteration_10.json` confirms both side panels stay sticky (top≈20px) through long-scroll positions with no blank columns/regressions.
- Auth logo verification: self-test + `auto_frontend_testing_agent` confirm logo rendering (`auth-brand-logo-image`), heading consistency (`Website builder.`), and no header/form overlap.
- Builder topbar logo verification: `auto_frontend_testing_agent` confirms logo shell/image render correctly, project title remains readable, and no overlap with topbar controls.
- Dashboard redesign verification: testing agent report `/app/test_reports/iteration_11.json` + `auto_frontend_testing_agent` confirm metrics panel above project list, clean list rows, working create/open/delete flows, and no overlap/overflow.
- Color toolbar verification: `auto_frontend_testing_agent` confirms improved contrast/readability for label/title/hex values/close button and clean non-washed appearance.
- Full UI contrast audit: `auto_frontend_testing_agent` confirms no missing/clipped text and no same-color text/background issues across auth, dashboard, and builder.
- Documentation verification: README/showcase update completed and auth-page smoke test confirms no runtime/frontend regression.
- Follow-up documentation update verified: README markdown styling simplified and frontend smoke test still passes.
- Additional docs follow-up: GitHub-friendly screenshot link paths confirmed with showcase assets present in-repo.
