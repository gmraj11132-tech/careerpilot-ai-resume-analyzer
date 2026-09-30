# Contribution Guide

Thank you for your interest in contributing to CareerPilot! 

## Getting Started

1. Fork the repository on GitHub.
2. Clone your fork locally.
3. Follow the instructions in the [SETUP.md](SETUP.md) file to get your development environment running.

## Development Workflow

1. **Create a branch**: Always create a new branch for your feature or bug fix.
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make changes**: Implement your feature, fix bugs, and ensure the code works as expected.
3. **Run tests**: Ensure all existing tests pass and write new tests for your feature.
   ```bash
   npm test
   ```
4. **Commit changes**: Write clear, descriptive commit messages.

## Code Style

- We use **TypeScript**. Ensure all new code has proper type definitions. Avoid using `any` unless absolutely necessary.
- Follow the existing project structure and component patterns (e.g., separating UI components from business logic).
- Ensure your code passes linting checks:
  ```bash
   npm run lint
   ```

## Pull Request Process

1. Push your branch to your forked repository.
2. Open a Pull Request (PR) against the `main` branch of the original repository.
3. Provide a clear description of the changes in the PR template.
4. Link any relevant issues.
5. Wait for review. A maintainer will review your code and may request changes before merging.

## Issue Reporting

If you find a bug or have a feature request, please open an issue on GitHub.
- Provide a clear title and description.
- For bugs, include steps to reproduce, expected behavior, and actual behavior.
- Include your environment details (OS, browser, Node version) if relevant.
