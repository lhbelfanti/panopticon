# DECISIONS.md

> **Purpose**: A log of Architectural Decision Records (ADR).

## Phase 1 Decisions

**Date:** 2026-02-27

### Scope
- Welcome screen activity summaries will use dynamic mock services to reflect realistic data.
- The Login and Register screen modules will reuse the existing implementation from the Binarizer project located at `/Users/lhbelfanti/workspace/github/binarizer/app/services/api/auth` (and relevant UI components) to save time, as requested.

### Approach
- Chose: Stateful In-Memory Mocks (Option A)
- Reason: Provides a more realistic development experience since state changes are reflected across different screens without the need for a real backend.

### Constraints
- An artificial delay of 500ms - 1s will be introduced in all mock API calls to ensure loading states (spinners/skeletons) are built robustly and properly handle async latency.
