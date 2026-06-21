# TODO - Fix AnimatedEcoIcon SVG path "undefined" error

- [x] Patch `src/components/eco-ui/AnimatedEcoIcon.tsx` to guarantee `d` is never `undefined` for any `motion.path` (especially leaf/impact) and to make animate props stable.
- [x] Update `src/pages/dashboard/DashboardHub.tsx` to use `AnimatedEcoIcon` with `intensity="bold"` instead of `"epic"`.
- [x] Update `src/pages/auth/LoginPage.tsx` to use `AnimatedEcoIcon` with `intensity="bold"` instead of `"epic"`.
- [x] Run app/build to confirm the SVG error is gone and all 6 icons render.
