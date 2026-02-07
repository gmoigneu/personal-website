---
title: Setting Up a Rock-Solid Typescript React Project with ESLint and Prettier
description: A practical guide to setting up a modern TypeScript React project with automated code formatting and quality checks. Learn how to configure ESLint and Prettier, set up VS Code for optimal development, and implement git hooks and CI pipelines to maintain code quality. Perfect for developers who want their codebase to stay clean and consistent without the hassle.
pubDate: 2025-01-20
---

Hey fellow devs! 👋 Let's talk about setting up a React project that's both fun to work with and maintainable. I'll share our setup that keeps our codebase clean and consistent.

## The Foundation: ESLint + Prettier = ❤️

First things first - we're using ESLint and Prettier together. Why both? ESLint catches potential bugs and enforces coding standards, while Prettier makes everything look pretty (pun intended). They're like the dynamic duo of code quality!

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "plugins": ["react", "@typescript-eslint", "prettier"],
  "rules": {
    "prettier/prettier": "error",
    "react/react-in-jsx-scope": "off",
    "no-unused-vars": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off"
  }
}
```

Let's break down this ESLint config:

- `extends`: We're building on top of recommended configs for ESLint, React, and TypeScript. The `prettier` config at the end ensures ESLint plays nice with Prettier.
- `plugins`: These add extra rules and functionality - we've got plugins for React, TypeScript, and Prettier integration.

Now with the rules:

- `prettier/prettier: "error"`: Forces Prettier's formatting as ESLint rules
- `react/react-in-jsx-scope: "off"`: Not needed in modern React with automatic JSX runtime
- `no-unused-vars: "warn"`: Yellow squiggles instead of red for unused variables
- `@typescript-eslint/explicit-module-boundary-types: "off"`: Lets us skip return type annotations when TypeScript can infer them

Time to look at the `.prettierrc` file:

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

And here's what our Prettier config does:

- `semi: false`: No semicolons! JavaScript has ASI (Automatic Semicolon Insertion)
- `singleQuote: true`: Use 'single quotes' instead of "double quotes" for strings
- `tabWidth: 2`: Two spaces for indentation (fight me 4-spacers! 😉)
- `trailingComma: "es5"`: Add trailing commas where valid in ES5 (cleaner git diffs)

## Editor Setup: Making Life Easier

The real magic happens in your editor. We're using Cursor (VSCode base) with these essential extensions:

- [Prettier ESLint](https://marketplace.visualstudio.com/items?itemName=rvest.vs-code-prettier-eslint)
- [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens) (because who doesn't want instant feedback?)

Here's a crucial part of our `settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Git Hooks: Your Code Quality Bouncer 🚫

We use Husky to run checks before commits. It's like having a bouncer that makes sure no messy code gets into your repo.

```bash
npx husky add .husky/pre-commit "npm run lint && npm run format"
```

And in your package.json:

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "format": "prettier --write .",
    "prepare": "husky install"
  }
}
```

## CI Pipeline: The Final Guardian

Our CI pipeline (using GitHub Actions) runs these checks on every PR:

```yaml
name: Code Quality
on: [pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Run linting
        run: npm run lint
      - name: Check formatting
        run: npm run format:check
```

## Why This Matters

1. **Consistency**: No more debates about tabs vs spaces or semicolons
2. **Productivity**: Auto-formatting on save = less time fixing formatting
3. **Code Quality**: Catch bugs before they make it to production
4. **Team Happiness**: New team members can jump right in without learning custom style guides

## Pro Tips 🚀

- Run `npx eslint --init` when starting a new project to get a good base config
- Use `.eslintignore` and `.prettierignore` for files you don't want to check
- Consider using TypeScript - it plays really well with this setup
- Keep your dependencies updated (but test before updating in production!)

## Common Gotchas to Watch Out For

- ESLint and Prettier fighting each other (solution: use `eslint-config-prettier`)
- Git hooks not running (check your Husky installation)
- Different formatters in different editors (standardize on Prettier!)

## Wrapping Up

This setup might seem like overkill at first, but trust me - it's worth it. Your future self (and your team) will thank you for setting up these guardrails early.

Remember: Good code isn't just about working features - it's about maintainability and consistency. These tools help you achieve both without thinking about it.

Happy coding! 🎉

---

_P.S. Feel free to steal this setup for your projects. That's what we're here for!_
