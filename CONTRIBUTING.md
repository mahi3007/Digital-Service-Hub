# Contributing to Digital Service Hub

Thank you for your interest in contributing to Digital Service Hub! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect differing viewpoints and experiences

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Node version, etc.)

### Suggesting Features

1. Check existing feature requests
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach
   - Any relevant examples

### Pull Requests

1. **Fork the repository**
```bash
git clone https://github.com/yourusername/Digital-Service-Hub.git
cd Digital-Service-Hub
```

2. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes**
   - Follow the existing code style
   - Write clear, concise commit messages
   - Add tests if applicable
   - Update documentation

4. **Test your changes**
```bash
# Run backend tests
npm test

# Run frontend tests
cd client
npm test
```

5. **Commit your changes**
```bash
git add .
git commit -m "feat: add new feature description"
```

Commit message format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

6. **Push to your fork**
```bash
git push origin feature/your-feature-name
```

7. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template
   - Link related issues

## Development Setup

1. Install dependencies
```bash
npm install
cd client && npm install
```

2. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start development servers
```bash
npm run dev:full
```

## Code Style Guidelines

### JavaScript/React
- Use ES6+ features
- Use functional components with hooks
- Follow Airbnb style guide
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### File Naming
- Components: PascalCase (e.g., `UserProfile.js`)
- Utilities: camelCase (e.g., `apiHelper.js`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.js`)

### Component Structure
```javascript
// Imports
import React, { useState, useEffect } from 'react';

// Component
const ComponentName = ({ prop1, prop2 }) => {
  // State
  const [state, setState] = useState(initialValue);
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // Handlers
  const handleEvent = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

### Backend Structure
```javascript
// Controller function
exports.functionName = async (req, res) => {
  try {
    // Logic here
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

## Testing Guidelines

### Backend Tests
- Test all API endpoints
- Test error handling
- Test authentication/authorization
- Test database operations

### Frontend Tests
- Test component rendering
- Test user interactions
- Test state management
- Test API integration

## Documentation

- Update README.md for major changes
- Add JSDoc comments for functions
- Update API documentation
- Include examples in documentation

## Project Structure

```
server/
├── controllers/     # Request handlers
├── models/         # Database schemas
├── routes/         # API routes
├── middleware/     # Custom middleware
├── utils/          # Helper functions
└── index.js        # Entry point

client/src/
├── components/     # Reusable components
├── pages/          # Page components
├── store/          # Redux store
├── utils/          # Utilities
└── App.js          # Main component
```

## Review Process

1. Automated checks must pass
2. Code review by maintainers
3. Address review comments
4. Approval from at least one maintainer
5. Merge to main branch

## Questions?

- Open an issue for discussion
- Join our community chat
- Email: dev@digitalservicehub.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Digital Service Hub! 🚀
