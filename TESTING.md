# Testing Guide

## Test Types

CareerPilot utilizes a comprehensive testing strategy to ensure reliability:
- **Unit Tests**: Focus on testing individual functions, services, and utility classes in isolation.
- **Integration Tests**: Verify that different modules (e.g., API routes and the database) work correctly together.

## Running Tests

To run the entire test suite, execute:
```bash
npm test
```

To run tests in watch mode (useful during development):
```bash
npm test -- --watch
```

## Test Structure

Tests are organized alongside their respective features or in a dedicated `__tests__` directory:
- `lib/**/*.test.ts`: Tests for utility functions.
- `services/**/*.test.ts`: Tests for business logic and services.
- `app/api/**/*.test.ts`: Integration tests for API endpoints.

## What is Tested

Our testing strategy covers the following critical areas:
- **Auth Validation**: Ensuring correct handling of valid/invalid credentials, password hashing integrity, and JWT generation/verification.
- **Resume Parsing**: Verifying that text extraction from various formats (PDF/TXT) works reliably.
- **Resume Scoring**: Testing the algorithms (or fallback logic) that calculate ATS scores and identify keywords.
- **Job Matching**: Ensuring the recommendation engine correctly correlates skills with job requirements.
- **API Endpoints**: Validating status codes, request parsing (Zod schemas), and response structures for all major REST endpoints.

## Writing New Tests

When adding new features or fixing bugs, follow these guidelines:
1. **Write the Test First (TDD)**: If possible, write a failing test that reproduces the bug or defines the new feature.
2. **Mock External Dependencies**: Use mocking libraries to isolate external calls (e.g., mocking the external AI API, or mocking Prisma for unit tests).
3. **Use Descriptive Names**: Test descriptions should clearly state what is being tested and the expected outcome (e.g., `it('should return 401 when invalid password is provided')`).
4. **Assert Edge Cases**: Don't just test the "happy path." Ensure error handling and edge cases are covered.
