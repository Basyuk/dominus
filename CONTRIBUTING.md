# Contributing to Dominus

Thank you for your interest in contributing to Dominus! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/Basyuk/dominus.git
   cd dominus
   ```
3. **Install dependencies**:
   ```bash
   ./install.sh
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🎯 Ways to Contribute

### 🐛 Bug Reports
- Use the [Bug Report Template](https://github.com/Basyuk/dominus/issues/new?labels=bug&template=bug_report.md)
- Search existing issues first
- Include detailed reproduction steps
- Provide environment information

### 💡 Feature Requests  
- Use the [Feature Request Template](https://github.com/Basyuk/dominus/issues/new?labels=enhancement&template=feature_request.md)
- Explain the use case and expected behavior
- Consider implementation complexity

### 📖 Documentation
- Fix typos and grammatical errors
- Add missing information
- Improve examples and explanations
- Update outdated content

### 🔧 Code Contributions
- Bug fixes
- New features
- Performance improvements
- Code refactoring

## 🏗️ Development Setup

### Prerequisites

- Node.js 18+ 
- npm 8+
- Git

### Local Development

1. **Setup backend:**
   ```bash
   cd backend
   cp env.example .env
   cp local-users.example.yml local-users.yml
   cp settings.example.yml settings.yml
   # Edit configuration files as needed
   npm run dev
   ```

2. **Setup frontend (new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

### Testing

#### Backend Tests
```bash
cd backend

# Test connectivity
npm run test-keycloak-connectivity

# Test authentication
npm run test-local admin password

# Test Keycloak (if configured)
npm run test-keycloak username password
```

#### Frontend Testing
```bash
cd frontend

# Development server
npm run dev

# Build test
npm run build
```

## 📝 Code Guidelines

### General Principles

- **Follow existing code style** and formatting
- **Write clear, readable code** with meaningful names
- **Add comments** for complex logic
- **Keep functions small** and focused
- **Handle errors gracefully**

### JavaScript/Node.js Guidelines

- Use `const` and `let` instead of `var`
- Use arrow functions for short functions
- Use async/await instead of callbacks
- Handle all Promise rejections
- Use meaningful variable and function names

### React Guidelines

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types (if using PropTypes)
- Handle loading and error states
- Follow React best practices

### Configuration Guidelines

- All backend services should be configurable via `settings.yml`
- Use environment variables for sensitive data
- Provide example configuration files
- Document all configuration options

## 🔄 Pull Request Process

### Before Submitting

1. **Search existing PRs** to avoid duplicates
2. **Create an issue** first for major changes
3. **Test your changes** thoroughly
4. **Update documentation** as needed
5. **Follow code guidelines**

### PR Requirements

- [ ] **Clear title and description**
- [ ] **Link to related issue(s)**
- [ ] **Type of change indicated** (bug fix, feature, docs, etc.)
- [ ] **Testing completed** and described
- [ ] **Documentation updated** if needed
- [ ] **No merge conflicts**
- [ ] **Follows code guidelines**

### PR Review Process

1. **Automated checks** must pass
2. **Manual review** by maintainers
3. **Feedback addressed** if requested
4. **Approval** by at least one maintainer
5. **Merge** when ready

## 🏷️ Issue Labels

### Type Labels
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to docs
- `question` - Further information is requested
- `duplicate` - This issue or pull request already exists
- `invalid` - This doesn't seem right
- `wontfix` - This will not be worked on

### Priority Labels
- `priority: critical` - Critical issue blocking users
- `priority: high` - High priority issue
- `priority: medium` - Medium priority issue  
- `priority: low` - Low priority issue

### Area Labels
- `area: backend` - Backend-related issue
- `area: frontend` - Frontend-related issue
- `area: auth` - Authentication-related
- `area: config` - Configuration-related
- `area: docker` - Docker-related

## 🎨 Backend Service Development

### Creating Compatible Services

To create a backend service compatible with Dominus:

1. **Implement required endpoints:**
   - Status endpoint (GET) - Returns all server statuses
   - Priority endpoint (PUT/POST) - Changes server priority

2. **Follow API contract:**
   ```javascript
   // Status endpoint response
   {
     "server1": { "status": "primary", "health": "ok" },
     "server2": { "status": "secondary", "health": "ok" }
   }
   
   // Priority endpoint request
   PUT /priority?role=primary&server=server1
   ```

3. **Handle timeouts gracefully**
4. **Return appropriate HTTP status codes**
5. **Document configuration options**

### Example Service Structure
```javascript
const express = require('express');
const app = express();

app.get('/api/status', (req, res) => {
  // Return status of all servers
  res.json({
    'server1': { status: 'primary', health: 'healthy' },
    'server2': { status: 'secondary', health: 'healthy' }
  });
});

app.put('/api/priority', (req, res) => {
  const { role, server } = req.query;
  // Change server priority logic here
  res.json({ success: true, message: 'Priority changed' });
});
```

## 📞 Communication

### Getting Help
- 📖 Check [Documentation](README.md)
- 🐛 [Search Issues](https://github.com/Basyuk/dominus/issues)
- 💬 [GitHub Discussions](https://github.com/Basyuk/dominus/discussions)

### Reporting Security Issues
For security vulnerabilities, please create a private issue or contact the maintainers directly instead of creating a public issue.

## 📜 Code of Conduct

### Our Standards

- **Be respectful** and inclusive
- **Be constructive** in feedback
- **Focus on what's best** for the community
- **Show empathy** towards other contributors

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Public or private harassment
- Publishing private information

### Enforcement

Project maintainers are responsible for clarifying standards and may take appropriate corrective action in response to unacceptable behavior.

## 🏆 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes (for significant contributions)
- Special thanks in documentation

## 📄 License

By contributing to Dominus, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Dominus! 🚀
