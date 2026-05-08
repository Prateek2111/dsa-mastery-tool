# DSA Mastery Tool

An AI-powered DSA Mastery Tracker designed to solve the common problem of forgetting problem-solving intuitions shortly after solving them. Instead of just counting solved questions, this tool focuses on **long-term retention and active recall**.

## 🚀 The Problem
Interview preparation often feels like a "grind" where you solve hundreds of problems but lose the intuition for them within days. Most trackers focus on quantity, not mastery or retention.

## 💡 The Solution
This app combines **Spaced Repetition** with **AI-Assisted Learning**. It helps you move from passive problem-solving to active reinforcement.

### Key Features
- **Spaced Repetition Schedule**: Automatically generates a revision timeline (Day 1, 3, 7, 15, etc.) when you solve a problem.
- **Interactive Revision Timeline**: Visualizes your progress and highlights problems due for revision.
- **Confidence-Based Tracking**: Mark revisions as done while tracking your confidence levels (Low, Medium, High).
- **Confidence Decay**: If you skip revisions repeatedly, the system automatically drops your confidence level, ensuring you revisit tricky topics.
- **AI Progressive Hints**: Instead of giving full solutions, the AI layer (powered by Gemini) provides three levels of hints:
    - **Hint 1: Brute Force** (Logic and basic intuition)
    - **Hint 2: Better Approach** (Improving time/space complexity)
    - **Hint 3: Optimal Approach** (The most efficient way to solve)
- **Automatic Metadata Extraction**: Paste a LeetCode or GFG URL, and the AI automatically extracts the title, platform, difficulty, and complexities.
- **Terminal Aesthetic**: A clean, high-contrast, developer-focused UI.

## 🔄 Core Loop
**Solve** → **Revise** → **Reinforce** → **Master**

## 🛠️ Tech Stack
- **Frontend**: React 19, Tailwind CSS 4, Vite, Lucide React, Recharts
- **Backend**: Node.js, Express, MongoDB, JWT Authentication
- **AI Integration**: Google Gemini 3.1 Flash Lite

## 🛠️ Future Scope (Next 10 Hours)
- **AI Weak Topic Detection**: Analyze patterns in skipped revisions to identify gaps in knowledge.
- **Personalized Recommendations**: Suggest problems based on current mastery levels.
- **"Explain My Mistake"**: AI analysis for specific incorrect approaches or logic.
- **Collaborative Revision Rooms**: Peer-to-peer learning and revision sessions.

## ✂️ What Was Cut (Intentionally)
- **Push Notifications**: Prioritized focused usage over intrusive alerts.
- **Full Social Features**: Kept it focused on personal growth.
- **Advanced Analytics**: Focused on the core revision loop first.
- **Complex UI Polish**: Opted for a fast, usable terminal-style design.
- **Multi-model AI Routing**: Standardized on Gemini for speed and reliability.

## 🧠 Philosophy
I prioritized **usability, learning behavior, and speed of execution** over feature count. The tool is designed to fit into a developer's existing workflow, making interview prep feel more structured and retention-focused.
