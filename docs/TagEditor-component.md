# TagEditor Component

## Overview

The TagEditor is a reusable React component that provides an intuitive interface for managing tags in forms. It allows users to:

- Add new tags by typing and pressing Enter
- Remove tags by clicking the cross icon on each tag
- Use backspace to remove the last tag when the input is empty
- Handle spaces in tag names properly
- Prevent duplicate tags

## Features

- **Interactive Tag Creation**: Type and press Enter to add tags
- **Visual Tag Display**: Tags are displayed as blue rounded pills with remove buttons
- **Keyboard Navigation**: Backspace to remove last tag when input is empty
- **Duplicate Prevention**: Automatically prevents adding duplicate tags
- **Customizable**: Supports custom placeholder text and CSS classes
- **Accessible**: Proper ARIA labels for screen readers
- **Disabled State**: Can be disabled for read-only views

## Props

```typescript
interface TagEditorProps {
  tags: string[];              // Current array of tags
  onChange: (tags: string[]) => void;  // Callback when tags change
  placeholder?: string;        // Placeholder text for input
  className?: string;          // Additional CSS classes
  disabled?: boolean;          // Disable the editor
}
```

## Usage Examples

### Basic Usage

```tsx
import TagEditor from '@/app/components/atom/TagEditor';

const [tags, setTags] = useState(['react', 'typescript']);

<TagEditor
  tags={tags}
  onChange={setTags}
  placeholder="Add tags..."
/>
```

### In a Form

```tsx
const [editForm, setEditForm] = useState({
  name: '',
  description: '',
  tags: [] as string[]
});

<TagEditor
  tags={editForm.tags}
  onChange={(newTags) => setEditForm({...editForm, tags: newTags})}
  placeholder="Type and press Enter to add tags..."
/>
```

### Read-only Display

```tsx
<TagEditor
  tags={item.tags}
  onChange={() => {}} // No-op function
  disabled={true}
/>
```

## Implementation Details

### Key Behaviors

1. **Adding Tags**: 
   - Type text and press Enter to add
   - Input loses focus (onBlur) also adds the current text as a tag
   - Trims whitespace and prevents empty tags
   - Prevents duplicate tags

2. **Removing Tags**:
   - Click the × icon on any tag
   - Press Backspace when input is empty to remove the last tag

3. **Visual Feedback**:
   - Focus ring appears when input is focused
   - Hover effects on remove buttons
   - Disabled state styling

### Styling

The component uses Tailwind CSS classes and follows the design system:

- **Container**: Border, rounded corners, padding, focus states
- **Tags**: Blue background, rounded pills with hover effects
- **Input**: Borderless, auto-expanding with placeholder text
- **Remove Buttons**: Subtle icons with hover states

## Current Implementation

The TagEditor has been integrated into the following management pages:

### ✅ Collection Management
- **Collection Detail Page**: `/manage/collections/[slug]`
- **Collection Creation Form**: `/manage` (main management page)

### ✅ Path Management  
- **Path Detail Page**: `/manage/paths/[path_slug]`

### 🔄 Future Integration Opportunities
- **Course Creation/Editing**: When course edit functionality is implemented
- **Lesson Creation/Editing**: When lesson edit functionality is implemented
- **Any other entity forms**: The component is ready for reuse

## Database Schema Support

Tags are supported in the following models:

- **Collections**: `tags: [String]`
- **Paths**: `tags: [String]`
- **Courses**: `tags: [String]`
- **Lessons**: `tags: [String]`

## API Integration

The TagEditor works seamlessly with existing API endpoints. When saving, simply include the tags array in the request body:

```javascript
const response = await fetch(`/api/collections/${slug}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...editForm,
    tags: editForm.tags // Array of strings
  }),
});
```

## Testing

To test the TagEditor:

1. Navigate to any collection detail page in edit mode
2. Try adding tags by typing and pressing Enter
3. Remove tags by clicking the × icon
4. Test keyboard navigation with Backspace
5. Verify no duplicate tags can be added
6. Check that spaces in tag names work correctly

## Accessibility

The TagEditor includes proper accessibility features:

- ARIA labels for remove buttons
- Keyboard navigation support
- Focus management
- Screen reader friendly markup

## Best Practices

1. **Always validate tags on the server side** - Don't rely only on client-side validation
2. **Consider tag normalization** - You might want to lowercase tags or remove special characters
3. **Implement tag suggestions** - Consider adding autocomplete for commonly used tags
4. **Set reasonable limits** - Consider limiting the number of tags or tag length
5. **Handle edge cases** - Very long tags, special characters, etc.

## Troubleshooting

### Common Issues

1. **Tags not saving**: Ensure the API endpoint accepts and processes the `tags` array
2. **Duplicate tags appearing**: Check that the component's duplicate prevention logic is working
3. **Styling issues**: Verify Tailwind CSS classes are available and not conflicting
4. **TypeScript errors**: Ensure proper typing for the `tags` prop as `string[]`

### Debug Tips

- Check browser console for any JavaScript errors
- Verify the `onChange` callback is properly updating the parent state
- Use React DevTools to inspect the component state
- Test with different tag lengths and special characters
