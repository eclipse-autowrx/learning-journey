# Certificate Generation System

This system provides automated certificate generation for users who complete courses. It supports both PDF and PNG formats with customizable text positioning.

## Features

- **Dual Format Support**: Generate certificates in both PDF and PNG formats
- **Centered Text Positioning**: Automatically centers user name, path name, and issue date
- **Template-Based**: Uses empty certificate templates for consistent design
- **API Endpoints**: RESTful API for certificate generation and issuance
- **Test Scripts**: Comprehensive testing tools for validation

## File Structure

```
cert/
├── certificate_empty.pdf     # PDF template
├── certificate_empty.png     # PNG template
├── certificate_sample.pdf    # Sample PDF with example text
└── certificate_sample.png    # Sample PNG with example text

src/pages/api/certificates/
├── generate.js               # Generate certificate from template
└── issue.js                  # Issue certificate for completed course

scripts/
├── test-certificate-standalone.js  # Standalone test (no server required)
├── test-certificate-generation.js  # API test (requires server)
└── test-certificate-api.js         # Full API test suite

test-certificates/            # Generated test certificates
```

## API Endpoints

### 1. Generate Certificate

**POST** `/api/certificates/generate`

Generates a certificate from template with custom text.

**Request Body:**
```json
{
  "userName": "John Doe",
  "pathName": "Full Stack Web Development", 
  "issueDate": "January 15, 2025",
  "format": "pdf"  // or "png"
}
```

**Response:**
- **Success**: Binary file (PDF or PNG)
- **Error**: JSON with error message

### 2. Issue Certificate

**POST** `/api/certificates/issue`

Issues a certificate for a user who completed a course.

**Request Body:**
```json
{
  "courseId": "course_123",
  "format": "pdf"  // or "png"
}
```

**Headers:**
- Authentication cookies required

**Response:**
- **Success**: Binary file (PDF or PNG)
- **Error**: JSON with error message

## Text Positioning

The system uses fixed positioning relative to template dimensions:

### PDF Certificates
- **User Name**: Center X, 55% height, 24pt font, bold
- **Path Name**: Center X, 45% height, 18pt font, regular
- **Issue Date**: Center X, 35% height, 14pt font, regular

### PNG Certificates  
- **User Name**: Center X, 55% height, 48px font, bold
- **Path Name**: Center X, 45% height, 36px font, regular
- **Issue Date**: Center X, 35% height, 28px font, regular

## Testing

### 1. Standalone Test (No Server Required)

```bash
node scripts/test-certificate-standalone.js
```

This test:
- Generates both PDF and PNG certificates
- Uses local template files
- Saves results to `test-certificates/` directory
- Shows positioning calculations

### 2. API Test (Server Required)

```bash
# Start development server first
npm run dev

# In another terminal
node scripts/test-certificate-api.js
```

This test:
- Tests the `/api/certificates/generate` endpoint
- Generates both PDF and PNG via API
- Validates server response
- Saves results to `test-certificates/` directory

### 3. Multiple Certificate Test

```bash
node scripts/test-certificate-generation.js --multiple
```

This test:
- Generates multiple certificates with different data
- Tests various user names and course names
- Validates consistent positioning

## Usage Examples

### Frontend Integration

```javascript
// Generate certificate for sharing
const generateCertificate = async (userName, pathName, format = 'pdf') => {
  const response = await fetch('/api/certificates/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userName,
      pathName,
      issueDate: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      format
    })
  });
  
  if (response.ok) {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    return url;
  }
  throw new Error('Failed to generate certificate');
};

// Issue certificate for completed course
const issueCertificate = async (courseId, format = 'pdf') => {
  const response = await fetch('/api/certificates/issue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId, format })
  });
  
  if (response.ok) {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    return url;
  }
  throw new Error('Failed to issue certificate');
};
```

### Backend Integration

```javascript
// Check course completion and issue certificate
const issueCertificateForUser = async (userId, courseId) => {
  // Check if user completed the course
  const completed = await checkCourseCompletion(userId, courseId);
  
  if (completed) {
    // Get user and course information
    const user = await getUserById(userId);
    const course = await getCourseById(courseId);
    
    // Generate certificate
    const certificate = await generateCertificate({
      userName: user.name,
      pathName: course.pathName,
      issueDate: new Date().toLocaleDateString(),
      format: 'pdf'
    });
    
    return certificate;
  }
  
  throw new Error('Course not completed');
};
```

## Customization

### Adjusting Text Positions

Edit the positioning values in the API files:

```javascript
// PDF positioning
const userNameY = height * 0.55;  // Adjust this value
const pathNameY = height * 0.45;  // Adjust this value  
const issueDateY = height * 0.35; // Adjust this value

// PNG positioning
const userNameY = height * 0.55;  // Adjust this value
const pathNameY = height * 0.45;  // Adjust this value
const issueDateY = height * 0.35; // Adjust this value
```

### Changing Font Sizes

```javascript
// PDF font sizes
const userNameFontSize = 24;  // Adjust this value
const pathNameFontSize = 18;  // Adjust this value
const issueDateFontSize = 14; // Adjust this value

// PNG font sizes  
const userNameFontSize = 48;  // Adjust this value
const pathNameFontSize = 36;  // Adjust this value
const issueDateFontSize = 28; // Adjust this value
```

### Adding New Text Fields

1. Add the field to the API request body
2. Calculate positioning in the generation functions
3. Add the text drawing code
4. Update test scripts with new field

## Dependencies

- `pdf-lib`: PDF manipulation and text rendering
- `sharp`: Image processing and PNG generation
- `canvas`: Canvas API for advanced image operations (optional)

## Troubleshooting

### Common Issues

1. **Template files not found**
   - Ensure `cert/` directory exists with template files
   - Check file permissions

2. **Text positioning incorrect**
   - Run standalone test to see positioning calculations
   - Adjust percentage values in API files
   - Check template dimensions

3. **Font rendering issues**
   - Verify font availability in PDF generation
   - Check SVG text rendering for PNG generation

4. **API errors**
   - Ensure development server is running
   - Check request body format
   - Verify authentication for issue endpoint

### Debug Mode

Enable debug logging by setting environment variable:
```bash
DEBUG=certificate node scripts/test-certificate-standalone.js
```

## Future Enhancements

- [ ] Support for custom fonts
- [ ] Multiple certificate templates
- [ ] Batch certificate generation
- [ ] Certificate validation and verification
- [ ] Integration with blockchain for authenticity
- [ ] Email delivery of certificates
- [ ] Certificate storage and retrieval system