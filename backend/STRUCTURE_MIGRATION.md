# Migration to New Settings Structure

## Overview of Changes

The code has been updated to support a new settings file structure where backend types are described in the `Types` section, and services reference these types.

## New Settings File Structure

### Old Structure (before changes)
```yaml
ServiceName:
  servers:
    - name: "Server1"
      primary_mode: "classic"
      status:
        url: "http://10.0.1.15:8080"
        method: "GET"
        headers:
          Authorization: "Basic dXNlcjpwYXNz"
      priority:
        url: "http://10.0.1.15:8080/setPrimary"
        method: "POST"
        headers:
          Authorization: "Basic dXNlcjpwYXNz"
```

### New Structure (after changes)
```yaml
Types:
  postgresql:
    primary_mode: "classic"
    status:
      url: "{host}/api/status"
      method: "GET"
      headers:
        Authorization: "{auth}"
    priority:
      url: "{host}/api/setPrimary"
      method: "POST"
      headers:
        Authorization: "{auth}"

Services:
  PostgreSQL:
    type: "postgresql"
    servers:
      - name: "PG1"
        host: "http://10.0.1.15:8080"
        auth: "Basic dXNlcjpwYXNz"
```

## Advantages of New Structure

1. **Type Reusability**: One type can be used for multiple services
2. **Centralized Management**: Changes to a type apply to all services of that type
3. **Simplified Configuration**: Less code duplication
4. **Better Readability**: Clear separation of types and services

## Backward Compatibility

The code supports both old and new structures. If the settings file contains the old structure, it will work without changes.

## Transformation Function

Added the `transformSettingsToLegacyFormat()` function, which:
- Determines the settings file structure
- If it's a new structure, transforms it to the old format for compatibility
- If it's an old structure, returns data as is

## Usage Examples

### Type Definition
```yaml
Types:
  postgresql:
    primary_mode: "classic"
    status:
      url: "{host}/api/status"
      method: "GET"
      headers:
        Authorization: "{auth}"
    priority:
      url: "{host}/api/setPrimary"
      method: "POST"
      headers:
        Authorization: "{auth}"
```

### Using Type in Service
```yaml
Services:
  PostgreSQL:
    type: "postgresql"
    servers:
      - name: "PG1"
        host: "http://10.0.1.15:8080"
        auth: "Basic dXNlcjpwYXNz"
```

## Migrating Existing Settings

To migrate existing settings:

1. Identify common service types
2. Create a `Types` section with descriptions of each type
3. Create a `Services` section with references to types
4. Remove duplicate configurations

## Testing

To test the new structure, use the `test-new-structure.js` file:

```bash
node test-new-structure.js
```

This file will show how the new structure is transformed to the old one.