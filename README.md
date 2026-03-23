# ORPHEUS ARG Workstation

This repo currently implements the **Phase 1 offline core** of the ORPHEUS master plan:

- login/signup flow backed by browser storage
- boot sequence and dashboard shell
- terminal-driven fake filesystem
- clue chain for `zt`, `ke`, `tl` → `ztketl`
- hidden progression hooks for later chat, ranking, and admin systems

## Recommended build order

1. **Offline Core**
   - dashboard
   - terminal
   - fake filesystem
   - puzzle loop
2. **Online System**
   - Node/Express API
   - real auth
   - persistent database
3. **Chat + Tracking**
   - WebSocket relay
   - message history
   - player action logging
4. **Admin Console**
   - player viewer
   - moderation tools
   - live puzzle support
5. **Manipulation Layer**
   - DEV_00 live injections
   - trust/compliance scoring
   - rank-gated narrative paths

## Current gameplay loop

- Sign in and watch the workstation boot.
- Open the dashboard and inspect the fake filesystem layout.
- Use the terminal to read logs and collect the three shard files.
- Run `unlock final_clue.txt ztketl`.
- Read `final_clue.txt` and decide whether to execute `override`.
