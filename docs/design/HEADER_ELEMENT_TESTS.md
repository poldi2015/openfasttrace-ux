# HeaderElement Unit Tests

## Overview
Comprehensive unit tests for the `HeaderElement` class that manages the application header with OFT logo, project name, and theme toggle button.

## Test File
`test/main/js/view/header_element.test.ts`

## Test Coverage

### 1. Instantiation Tests
- ✅ **HeaderElement can be instantiated correctly**
  - Verifies the element can be created
  - Checks initial inactive state

### 2. Initialization Tests
- ✅ **HeaderElement.init() sets project name**
  - Verifies project name is set in the DOM
  - Validates HTML structure matches expected output

- ✅ **HeaderElement.init() initializes navbar with theme toggle button**
  - Checks theme toggle button exists
  - Verifies correct CSS classes are applied

- ✅ **HeaderElement.init() returns itself for chaining**
  - Tests fluent interface pattern

### 3. Activation Tests
- ✅ **HeaderElement.activate() enables theme toggle button**
  - Verifies activation state
  - Checks button is not disabled

- ✅ **HeaderElement.deactivate() disables theme toggle button**
  - Verifies deactivation state
  - Checks button is disabled

### 4. Theme Toggle Functionality
- ✅ **clicking theme toggle button calls themeController.toggleTheme()**
  - Mocks ThemeController
  - Verifies theme toggle is called on click

- ✅ **theme toggle button toggles state when clicked**
  - Tests button state changes (on/off)
  - Verifies `nav-btn-on` class toggling

- ✅ **multiple theme toggle clicks call themeController multiple times**
  - Tests multiple consecutive clicks
  - Verifies each click triggers theme toggle

- ✅ **deactivated header does not respond to button clicks**
  - Tests that disabled buttons don't trigger actions
  - Verifies proper lifecycle management

### 5. Method Chaining Tests
- ✅ **HeaderElement supports method chaining init().activate()**
  - Tests fluent interface with multiple methods
  - Verifies end state is correct

### 6. Edge Cases
- ✅ **HeaderElement with empty project name**
  - Tests handling of empty string

- ✅ **HeaderElement with special characters in project name**
  - Tests HTML entity escaping
  - Verifies special characters are properly handled

- ✅ **HeaderElement handles missing header element gracefully**
  - Tests behavior with non-existent DOM element
  - Verifies no exceptions are thrown

## Running the Tests

### Run all tests:
```bash
npm test
```

### Run only HeaderElement tests:
```bash
npm test -- header_element
```

### Run tests in watch mode:
```bash
npm test -- --watch
```

### Run with coverage:
```bash
npm test -- --coverage
```

## Test Structure

Each test follows this pattern:

```typescript
test("description of what is being tested", () => {
    // 1. Setup
    const headerElement = new HeaderElement(...);
    
    // 2. Exercise
    headerElement.init();
    
    // 3. Verify
    expect(result).toBe(expected);
});
```

## Mocking

The tests use Vitest's mocking capabilities:

```typescript
// Mock ThemeController methods
const mockToggleTheme = vi.spyOn(themeController, 'toggleTheme');
```

## DOM Setup

Each test:
1. Creates a fresh DOM structure using the `HTML_HEADER` template
2. Cleans up after itself with `beforeEach` and `afterEach` hooks
3. Uses jQuery fixtures from `@test/fixtures/dom`

## Dependencies

- **vitest** - Test framework
- **@test/fixtures/fixtures** - Test fixtures and utilities
- **@test/fixtures/dom** - DOM manipulation utilities
- **HeaderElement** - Class under test
- **ThemeController** - Mocked dependency
- **NavbarElement** - Tested through HeaderElement
- **ButtonElement** - Tested indirectly through navbar

## Test Assertions

Common assertions used:
- `expect(value).toBe(expected)` - Strict equality
- `expect(value).toBeDefined()` - Value is not undefined
- `expect(element.hasClass('class')).toBe(true)` - CSS class presence
- `expect(mock).toHaveBeenCalledTimes(n)` - Mock call count
- `expect(() => fn()).not.toThrow()` - Error handling
- `expect(body).toMatchHTML(expected)` - HTML structure matching

## Coverage Goals

Target coverage for HeaderElement:
- ✅ **Statements**: 100%
- ✅ **Branches**: 100%
- ✅ **Functions**: 100%
- ✅ **Lines**: 100%

## Integration Points Tested

1. **HeaderElement ↔ NavbarElement**
   - Initialization flow
   - Activation/deactivation
   - Event delegation

2. **HeaderElement ↔ ThemeController**
   - Theme toggle calls
   - Initialization

3. **HeaderElement ↔ ButtonElement** (indirect)
   - Button state changes
   - Click handling
   - Disabled state

4. **HeaderElement ↔ DOM**
   - Project name rendering
   - Button availability
   - HTML structure

## Future Test Enhancements

Potential additional tests:
- [ ] Performance testing with many rapid clicks
- [ ] Accessibility testing (ARIA attributes)
- [ ] Keyboard navigation testing
- [ ] Mobile/touch event testing
- [ ] Memory leak detection
- [ ] Theme persistence testing
