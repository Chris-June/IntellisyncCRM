# Authentication Context

## Overview
This directory contains the core authentication context and related utilities for the application.

## Files
- `auth-context.tsx`: Main authentication context provider
- `use-auth.ts`: Custom hook for accessing authentication context

## Key Features
- Centralized authentication state management
- Type-safe authentication methods
- Integrated with Supabase authentication
- Provides methods for:
  - Sign up
  - Sign in
  - Sign out
  - Password reset
  - Profile updates

## Best Practices
- Always use `useAuth()` hook to access authentication context
- Handle authentication errors gracefully
- Implement proper type checking and error handling

## Improvements in Latest Iteration
- Separated authentication logic into modular files
- Enhanced type safety
- Improved error handling
- Added comprehensive toast notifications
