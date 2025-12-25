# Certificate System Usage Guide

## Overview

The certificate system automatically generates PDF and PNG certificates when users complete learning paths. It includes:

- ✅ **Auto-generation** when paths are completed
- ✅ **Storage** in `public/certificates/` directory
- ✅ **Database integration** to store certificate links
- ✅ **Frontend modal** for viewing and downloading certificates
- ✅ **Custom name editing** with regeneration capability

## API Endpoints

### 1. Complete Path and Generate Certificate

**POST** `/api/certificates/complete-path`

Generates a certificate when a user completes a path.

**Request Body:**
```json
{
  "pathId": "path_123",
  "pathName": "Full Stack Web Development"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate generated successfully",
  "certificate": {
    "pdfUrl": "/certificates/pdf/cert_user123_path456_1234567890.pdf",
    "pngUrl": "/certificates/png/cert_user123_path456_1234567890.png",
    "fileName": "cert_user123_path456_1234567890"
  }
}
```

### 2. Get Certificate Information

**GET** `/api/certificates/get?pathId=path_123`

Retrieves certificate information for a completed path.

**Response:**
```json
{
  "success": true,
  "certificate": {
    "pdfUrl": "/certificates/pdf/cert_user123_path456_1234567890.pdf",
    "pngUrl": "/certificates/png/cert_user123_path456_1234567890.png",
    "fileName": "cert_user123_path456_1234567890",
    "generatedAt": "2025-01-15T10:30:00.000Z",
    "customUserName": null
  }
}
```

### 3. Regenerate Certificate with Custom Name

**POST** `/api/certificates/regenerate`

Regenerates a certificate with a custom user name.

**Request Body:**
```json
{
  "pathId": "path_123",
  "pathName": "Full Stack Web Development",
  "customUserName": "Johnny Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate regenerated successfully",
  "certificate": {
    "pdfUrl": "/certificates/pdf/cert_user123_path456_1234567891.pdf",
    "pngUrl": "/certificates/png/cert_user123_path456_1234567891.png",
    "fileName": "cert_user123_path456_1234567891"
  }
}
```

## Frontend Integration

### 1. Certificate Modal Component

```tsx
import CertificateModal from '@/app/components/CertificateModal';

function MyComponent() {
  const [showCertificate, setShowCertificate] = useState(false);
  const [pathId, setPathId] = useState('');

  return (
    <div>
      <button onClick={() => setShowCertificate(true)}>
        View Certificate
      </button>
      
      <CertificateModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        pathId={pathId}
        pathName="Full Stack Web Development"
        userId="user123"
      />
    </div>
  );
}
```

### 2. Integration with Path Progress

```tsx
// In your path completion component
const handlePathComplete = async (pathId, pathName) => {
  try {
    // Mark path as completed in your database
    await markPathCompleted(pathId);
    
    // Generate certificate
    const response = await fetch('/api/certificates/complete-path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pathId, pathName })
    });
    
    if (response.ok) {
      const data = await response.json();
      // Store certificate links in your database
      await saveCertificateLinks(pathId, data.certificate);
      
      // Show success message
      showSuccessMessage('Certificate generated successfully!');
    }
  } catch (error) {
    console.error('Error completing path:', error);
  }
};
```

## Database Integration

### PathProgress Model Update

Add certificate fields to your PathProgress model:

```javascript
// Example MongoDB schema
const PathProgressSchema = {
  user_id: String,
  path_id: String,
  completed: Boolean,
  completed_at: Date,
  certificate: {
    pdfUrl: String,
    pngUrl: String,
    fileName: String,
    generatedAt: Date,
    customUserName: String
  }
};
```

### Database Functions to Implement

You need to implement these functions in your API endpoints:

1. **`checkPathCompletion(userId, pathId)`** - Check if user completed the path
2. **`getExistingCertificate(userId, pathId)`** - Get existing certificate info
3. **`saveCertificateLinks(userId, pathId, certificate)`** - Save certificate links
4. **`updateCertificateLinks(userId, pathId, certificate)`** - Update certificate links

## File Structure

```
public/
├── certificates/
│   ├── pdf/           # PDF certificates
│   └── png/           # PNG certificates
├── ...

src/
├── lib/
│   ├── certificate-service.js    # Certificate generation service
│   └── certificate-config.js     # Configuration loader
├── pages/api/certificates/
│   ├── complete-path.js          # Complete path endpoint
│   ├── get.js                    # Get certificate endpoint
│   └── regenerate.js             # Regenerate certificate endpoint
├── app/components/
│   └── CertificateModal.tsx      # Frontend modal component
└── ...
```

## Configuration

All positioning and font settings are in `certificate_gen.cfg`:

```ini
# Text positioning (in cm from top of certificate)
user_name_y_cm = 11.0
path_name_y_cm = 13.5
issue_date_y_cm = 15.0

# Font sizes and multipliers
user_name_font_size = 24
user_name_font_multiplier = 1.4
```

## Usage Flow

1. **User completes a path** → Call `/api/certificates/complete-path`
2. **Certificate is generated** → Stored in `public/certificates/`
3. **Links are saved** → Stored in database
4. **User clicks certificate** → Show `CertificateModal`
5. **User can view PNG** → Display in modal
6. **User can download PDF** → Download button
7. **User can edit name** → Regenerate with custom name

## Security Notes

- All endpoints require authentication
- Users can only access their own certificates
- File names include user ID to prevent conflicts
- Temporary files are cleaned up automatically

## Testing

Run the test script to verify the system:

```bash
node scripts/test-certificate-system.js
```

This will test all API endpoints and verify file generation.