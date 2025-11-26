# Copy to Clipboard Feature

## Overview
Added copy-to-clipboard buttons next to specitem IDs in both the main list view and the details panel, allowing users to easily copy requirement IDs for reference in other documents or tools.

## Implementation

### 1. **Main List View (SpecItemElement)**

#### Location
- Button appears next to the specitem ID `[ID]` in the header of each specitem card
- Positioned inline with the specitem name

#### Visual Design
- Uses Material Icons `content_copy` icon
- Small, unobtrusive button (14px icon)
- 60% opacity by default, 100% on hover
- Smooth hover effect with scale (1.1x) and light background
- Success feedback: Green background for 1 second after successful copy

#### Functionality
```typescript
// Copies the specitem.id to clipboard
navigator.clipboard.writeText(this.specItem.id)
```

#### User Experience
- Click stops propagation (doesn't select the specitem)
- Visual feedback: Button turns green briefly on successful copy
- Tooltip: "Copy ID to clipboard"

### 2. **Details Panel (DetailsElement)**

#### Location
- Button appears next to the specitem ID in the details panel header
- Shows/hides based on whether a specitem is selected

#### Visual Design
- Uses Material Icons `content_copy` icon
- Slightly larger than list view button (16px icon)
- 70% opacity by default, 100% on hover
- Smooth hover effect with scale (1.1x) and light background
- Success feedback: Green background for 1 second after successful copy

#### Functionality
```typescript
// Stores current specitem ID when table is updated
this.currentSpecItemId = specItem.id;

// Copies on button click
navigator.clipboard.writeText(this.currentSpecItemId)
```

#### User Experience
- Hidden when no specitem is selected
- Shows when a specitem is displayed in details
- Visual feedback: Button turns green briefly on successful copy
- Tooltip: "Copy ID to clipboard"

## Technical Details

### Dependencies
- **Material Icons**: Added Google Fonts Material Icons to HTML
  ```html
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  ```

### CSS Classes

#### SpecItem Copy Button
```scss
._specitem-copy-btn {
  - Inline-flex button with material icon
  - 14px icon size
  - Opacity transitions
  - Hover scale effect
  - Success state with green background
}
```

#### Details Copy Button
```scss
._details-copy-btn {
  - Inline-flex button with material icon
  - 16px icon size (slightly larger)
  - Similar transitions and effects
  - Success state with green background
}
```

### Browser Compatibility
- Uses modern `navigator.clipboard.writeText()` API
- Supported in all modern browsers (Chrome 63+, Firefox 53+, Safari 13.1+, Edge 79+)
- Falls back gracefully with console logging on older browsers

## User Benefits

1. **Quick Reference**: Easily copy requirement IDs for documentation
2. **Integration**: Paste IDs into issue trackers, emails, or documents
3. **Efficiency**: No need to manually select and copy text
4. **Feedback**: Clear visual indication of successful copy
5. **Accessibility**: Available in both list and detail views

## Future Enhancements

Potential improvements:
- Add keyboard shortcut (e.g., Ctrl+C when item is selected)
- Copy full requirement reference including title
- Copy markdown or HTML formatted links
- Batch copy multiple selected IDs
- Persistent notification for copy confirmation
- Copy additional fields (status, tags, etc.)
