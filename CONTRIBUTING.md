# Contributing to Dostoevsky Chess

Thank you for your interest in contributing! This project welcomes contributions from everyone.

## 🎯 Ways to Contribute

- **Bug Reports**: Found a bug? Open an issue with reproduction steps
- **Feature Requests**: Have an idea? Share it in the issues
- **Code Contributions**: Submit pull requests for fixes or features
- **Documentation**: Improve README, add tutorials, or write guides
- **Design**: Enhance UI/UX, create themes, or add animations
- **Content**: Add more Dostoevsky quotes or philosophical musings

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/dostoevsky-chess.git
   cd dostoevsky-chess
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Test your changes locally

5. **Test locally**
   ```bash
   python -m http.server 8000
   # Visit http://localhost:8000
   ```

6. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: Description of your changes"
   ```

7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Describe your changes

## 📝 Code Style

- Use clear, descriptive variable names
- Comment complex logic
- Keep functions focused and concise
- Follow existing formatting patterns

### JavaScript
```javascript
// Good
function handleSquareClick(square) {
    if (!isValidMove(square)) return;
    makeMove(square);
}

// Bad
function hsq(s) {
    if(!iv(s))return;
    mm(s);
}
```

### CSS
```css
/* Good */
.chess-board {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
}

/* Bad */
.cb{display:grid;grid-template-columns:repeat(8,1fr)}
```

## 🐛 Bug Reports

Include:
- **Description**: What went wrong?
- **Steps to Reproduce**: How can we see the bug?
- **Expected Behavior**: What should happen?
- **Actual Behavior**: What actually happened?
- **Screenshots**: If applicable
- **Browser/OS**: What system are you using?

## ✨ Feature Requests

Include:
- **Problem**: What problem does this solve?
- **Solution**: Your proposed solution
- **Alternatives**: Other solutions considered
- **Additional Context**: Mockups, examples, etc.

## 🎨 Design Contributions

- Keep the Dostoevsky theme (dark, philosophical)
- Maintain accessibility (contrast, readability)
- Test responsive design on multiple devices
- Use CSS variables for theming

## 📚 Documentation

- Fix typos or unclear instructions
- Add examples or tutorials
- Improve deployment guides
- Translate to other languages

## 🔍 Code Review Process

1. Maintainer reviews your PR
2. Feedback provided if needed
3. Make requested changes
4. PR merged when approved

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes
- Forever appreciated!

## 💬 Questions?

- Open an issue for questions
- Tag with "question" label
- Be patient and respectful

## 🎭 Philosophy

> "To go wrong in one's own way is better than to go right in someone else's."
> — Fyodor Dostoevsky

Feel free to experiment and be creative! This is a project born from the marriage of technology and literature.

---

**Thank you for contributing to Dostoevsky Chess!** ♟️
