# Application Security

## XSS (Cross-Site Scripting) Protection

### Implemented Changes

1. **Created security module** (`src/utils/security.js`):
   - `escapeHtml()` - escapes HTML symbols
   - `safeText()` - safely displays text
   - `safeDisplayText()` - complete function for safe display
   - `sanitizeServiceData()` - sanitizes service data
   - `isSafeUrl()` - checks URL safety

2. **Updated components**:
   - `ServicesTable.jsx` - safe display of hostname and status
   - `BulkSelectError.jsx` - safe display of service names
   - `MainPage.jsx` - safe display of errors
   - `Header.jsx` - safe display of authentication information
   - `LoginForm.jsx` - safe display of login errors
   - `AuthCallback.jsx` - safe display of authorization errors

3. **Updated useServices hook**:
   - Added sanitization of service and status data
   - Incoming data validation

### Security Principles

1. **Data escaping**: All user data is escaped before display
2. **Incoming data validation**: Type and data length checking
3. **Length limitation**: Trimming excessively long strings
4. **URL checking**: Protocol validation in URLs

### Developer Recommendations

1. **Always use `safeDisplayText()`** for displaying user data
2. **Validate data** at the API level
3. **Limit the length** of incoming data
4. **Use Content Security Policy (CSP)** in production

### Usage Examples

```javascript
import { safeDisplayText, sanitizeServiceData } from '../utils/security';

// Safe text display
<Typography>{safeDisplayText(userInput)}</Typography>

// Service data sanitization
const cleanData = sanitizeServiceData(rawServiceData);
```

### Additional Security Measures

1. **Content Security Policy**: Add CSP headers
2. **HTTPS**: Use HTTPS only in production
3. **Server validation**: Duplicate checks on backend
4. **Logging**: Log suspicious activity