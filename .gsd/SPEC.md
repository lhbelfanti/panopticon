# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
Panopticon is a React Router-based frontend web application that enables researchers to analyze text from social networks (primarily X) to predict Adverse Human Behaviours (such as drug consumption, anorexia, suicidal ideation) using LLMs and other ML models via the Panoptic backend API.

## Goals
1. Provide a modern, intuitive, and responsive interface for researchers to register, login, and manage their analysis projects.
2. Enable users to create projects focused on specific Adverse Human Behaviours and upload entries (single or bulk text data).
3. Facilitate async model predictions, offering a clear visual representation of analysis progress and detailed prediction results.
4. Establish a solid foundation using React Router v7, Vite, and Tailwind CSS following strict code conventions and API separation.

## Non-Goals (Out of Scope)
- Actual backend implementation (using Panoptic), initially all API calls will be mocked.
- Direct live integration with the X API (texts will be provided by researchers).
- Any features beyond what is specified in the TASKS.md file.

## Users
Researchers and data analysts who need a specialized tool to categorize and tag social media posts regarding Adverse Human Behaviours for study and intervention planning.

## Constraints
- **Technical**: Must follow the exact `CODE_CONVENTIONS.md` (React Router v7 in Framework mode, explicit BFF pattern, Tailwind CSS).
- **Styling**: Strict adherence to the provided dark color palette (`--jet`, `--onyx`, `--bittersweet-shimmer`, etc.).
- **Data**: Initial development must employ robust mocks for all backend interactions.
- **Language**: Bilingual support (English routing default, Spanish support).

## Success Criteria
- [ ] Users can login and access a Welcome Dashboard.
- [ ] Users can create a new project and add entries (tweets) manually or via bulk upload.
- [ ] Users can trigger the async prediction process and view progress.
- [ ] Users can view detailed prediction results in a modal with graphs and insights.
- [ ] The app matches the design expectations set by the defined color palette and Stitch mockups.
