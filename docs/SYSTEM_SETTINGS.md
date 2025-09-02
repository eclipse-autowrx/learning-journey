# System Settings Documentation

## Overview

The System Settings feature provides a centralized way to manage application configuration through a key-value store in the database. This allows for dynamic configuration without requiring code changes or server restarts.

## Features

- **Key-Value Storage**: Store any JSON-serializable value with a string key
- **Secret Settings**: Mark sensitive settings (like API keys) as secret - only admins can view them
- **Categories**: Organize settings by category (ui, api, general, etc.)
- **Role-Based Access**: Only users with `manageUsers` permission can create/update/delete settings
- **Public API**: Non-secret settings are accessible to all users via public API

## Database Schema

### SystemSettings Collection

```javascript
{
  _id: ObjectId,
  key: String (required, unique, max 255 chars),
  value: Mixed (required, any JSON-serializable value),
  secret: Boolean (default: false),
  description: String (optional, max 1000 chars),
  category: String (default: 'general', max 100 chars),
  updated_by: String (required, user ID who last updated),
  created_at: Date,
  updated_at: Date
}
```

## API Endpoints

### Admin APIs (Requires `manageUsers` permission)

#### GET `/api/admin/settings`
List all settings (optionally include secrets)

**Query Parameters:**
- `category` (optional): Filter by category
- `include_secrets` (optional): Include secret settings (default: false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "key": "PRIMARY_COLOR",
      "value": "#3B82F6",
      "secret": false,
      "description": "Primary brand color",
      "category": "ui",
      "updated_by": "user123",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST `/api/admin/settings`
Create a new setting

**Request Body:**
```json
{
  "key": "NEW_SETTING",
  "value": "setting value",
  "secret": false,
  "description": "Optional description",
  "category": "general"
}
```

#### GET `/api/admin/settings/[key]`
Get a specific setting by key

#### PUT `/api/admin/settings/[key]`
Update a specific setting

**Request Body:**
```json
{
  "value": "new value",
  "secret": true,
  "description": "Updated description",
  "category": "api"
}
```

#### DELETE `/api/admin/settings/[key]`
Delete a specific setting

### Public API (No authentication required)

#### GET `/api/settings`
Get all non-secret settings

**Query Parameters:**
- `category` (optional): Filter by category
- `key` (optional): Get specific setting by key

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "key": "PRIMARY_COLOR",
      "value": "#3B82F6",
      "secret": false,
      "description": "Primary brand color",
      "category": "ui",
      "updated_by": "user123",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Admin Interface

The admin interface is available at `/admin` under the "System Settings" tab. Features include:

- **View Settings**: Table view of all settings with filtering options
- **Include Secrets**: Toggle to show/hide secret settings
- **Create Setting**: Add new settings with form validation
- **Edit Setting**: Modify existing settings
- **Delete Setting**: Remove settings with confirmation
- **Category Filtering**: Organize settings by category

## Usage Examples

### Frontend Usage

```javascript
// Get public settings
const response = await fetch('/api/settings');
const { data: settings } = await response.json();

// Find specific setting
const primaryColor = settings.find(s => s.key === 'PRIMARY_COLOR')?.value || '#3B82F6';

// Get settings by category
const uiSettings = settings.filter(s => s.category === 'ui');
```

### Backend Usage

```javascript
import SystemSettings from '../lib/models/SystemSettings.js';

// Get a setting
const setting = await SystemSettings.findOne({ key: 'PRIMARY_COLOR' });
const primaryColor = setting?.value || '#3B82F6';

// Get all non-secret settings
const publicSettings = await SystemSettings.find({ secret: { $ne: true } });
```

## Sample Settings

Run the sample data script to populate common settings:

```bash
node scripts/populate-sample-settings.js
```

This creates settings for:
- UI colors and fonts
- Feature flags
- API keys (marked as secret)
- System limits and timeouts
- Notification preferences

## Security Considerations

1. **Secret Settings**: Never expose secret settings through public APIs
2. **Input Validation**: All values are stored as-is, validate on the client side
3. **Access Control**: Only users with `manageUsers` permission can modify settings
4. **Audit Trail**: All changes are tracked with `updated_by` and timestamps

## Best Practices

1. **Naming Convention**: Use UPPER_CASE for setting keys
2. **Categories**: Use consistent categories (ui, api, general, auth, etc.)
3. **Descriptions**: Always provide clear descriptions for settings
4. **Default Values**: Handle missing settings gracefully in your code
5. **Validation**: Validate setting values before using them in your application

## Migration from Environment Variables

If you're migrating from environment variables, consider:

1. **Gradual Migration**: Move settings one by one to test functionality
2. **Fallback Values**: Keep environment variable fallbacks during transition
3. **Documentation**: Update documentation to reflect new setting locations
4. **Team Training**: Ensure team knows how to manage settings via admin interface
