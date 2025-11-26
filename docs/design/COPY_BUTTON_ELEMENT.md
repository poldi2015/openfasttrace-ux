# CopyButtonElement Class

## Overview

The `CopyButtonElement` class is a reusable component that provides copy-to-clipboard functionality with visual feedback. It encapsulates the clipboard API logic and success state management.

## Location

- **Implementation**: `src/main/js/view/copy_button_element.ts`
- **Styles**: `src/main/css/button.scss` (see `._copy-btn` and `._copy-btn-sm`)

## Architecture

### Constructor

```typescript
constructor(
    buttonElement: JQuery<HTMLElement>,
    getText: () => string | null
)
```

**Parameters:**
- `buttonElement`: The jQuery element representing the copy button
- `getText`: A function that returns the text to copy (or null if nothing should be copied)

### Key Methods

#### `init(): CopyButtonElement`
Initializes the copy button by attaching click event listeners. Must be called after construction.

#### `setVisible(visible: boolean): void`
Shows or hides the copy button.

#### `getElement(): JQuery<HTMLElement>`
Returns the underlying jQuery button element.

## Usage Examples

### Example 1: Details View
```typescript
// In details_element.ts
this.copyButton = new CopyButtonElement(
    $('#details-copy-btn'),
    () => this.currentSpecItemId
).init();

// Show/hide based on selection
this.copyButton.setVisible(specItem != null);
```

### Example 2: Spec Item List
```typescript
// In spec_item_element.ts
this.copyButton = new CopyButtonElement(
    template.find('._copy-btn-sm'),
    () => this.specItem.id
).init();
```

## Styling

### Base Copy Button (`._copy-btn`)
- **Size**: 24x24px
- **Icon**: 16x16px
- **Use case**: Standard size for headers and panels

### Small Copy Button (`._copy-btn-sm`)
- **Size**: 18x18px
- **Icon**: 14x14px
- **Use case**: Inline use in spec item lists

### States
- **Default**: `opacity: 0.7` (standard), `opacity: 0.6` (small)
- **Hover**: `opacity: 1`, background highlight, scale up
- **Active**: Scale down slightly
- **Success**: Green background (`._copy-success` class), auto-removes after 1 second

## HTML Structure

```html
<!-- Standard copy button -->
<button class="_copy-btn" title="Copy ID to clipboard">
    <span class="_img-content-copy"></span>
</button>

<!-- Small copy button -->
<button class="_copy-btn-sm" title="Copy ID to clipboard">
    <span class="_img-content-copy"></span>
</button>
```

## Features

1. **Clipboard API Integration**: Uses `navigator.clipboard.writeText()` for secure copying
2. **Visual Feedback**: Shows success state with green background for 1 second
3. **Event Handling**: Stops event propagation to prevent interference with parent elements
4. **Error Handling**: Logs errors if clipboard operation fails
5. **Flexible Text Source**: getText callback allows dynamic text retrieval
6. **Show/Hide Support**: Easy visibility control via `setVisible()`

## Browser Compatibility

Requires browsers that support:
- `navigator.clipboard.writeText()` API
- HTTPS context (clipboard API requires secure context)

For development on `localhost`, HTTP is also supported.

## Benefits

1. **Reusability**: Single implementation used across multiple views
2. **Maintainability**: Centralized clipboard logic and success feedback
3. **Consistency**: Identical behavior and styling across all copy buttons
4. **Testability**: Isolated component that can be tested independently
5. **Simplicity**: Clean API with minimal configuration

## Migration Notes

Previously, copy button logic was duplicated in:
- `details_element.ts` (had `setupCopyButton()` and `copyToClipboard()` methods)
- `spec_item_element.ts` (had `copyToClipboard()` method in `addListenersToTemplate()`)

Both have been replaced with the unified `CopyButtonElement` class.
