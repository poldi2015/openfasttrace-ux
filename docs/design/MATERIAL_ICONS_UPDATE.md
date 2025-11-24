# Material Design Icons for Theme Toggle

## Summary
Updated the theme toggle button to use official Google Material Design icons instead of CSS-generated icons.

## Changes Made

### 1. Added Google Material Design Icons

Downloaded two official Material Symbols from [Google Fonts Icons](https://fonts.google.com/icons):

- **`material_dark_mode.svg`** - Moon icon (shown in light mode to switch to dark)
- **`material_light_mode.svg`** - Sun icon (shown in dark mode to switch to light)

Both icons are from the Material Symbols Outlined style and are stored in:
- `/src/main/resources/images/material_dark_mode.svg`
- `/src/main/resources/images/material_light_mode.svg`

### 2. Updated Icon Styles (`src/main/css/icons.scss`)

Replaced the CSS-generated theme toggle icons with the proper SVG icons:

```scss
// Light mode: show dark_mode icon (moon)
:root.light-theme #btn-theme-toggle,
:root:not(.dark-theme) #btn-theme-toggle {
  background-image: url("~@images/material_dark_mode.svg");
}

// Dark mode: show light_mode icon (sun)
:root.dark-theme #btn-theme-toggle {
  background-image: url("~@images/material_light_mode.svg");
}
```

Added a subtle rotation effect on hover:
```scss
&:hover {
  transform: rotate(20deg);
}
```

## Icon Details

### Dark Mode Icon (Moon)
- **Name**: dark_mode
- **Style**: Outlined
- **Usage**: Displayed in light mode to indicate "switch to dark mode"
- **Appearance**: Crescent moon shape

### Light Mode Icon (Sun)
- **Name**: light_mode  
- **Style**: Outlined
- **Usage**: Displayed in dark mode to indicate "switch to light mode"
- **Appearance**: Sun with rays

## Benefits

1. **Professional appearance**: Official Material Design icons are well-designed and consistent
2. **Better clarity**: Clear, recognizable symbols for light/dark mode
3. **Scalable**: SVG format scales perfectly at any size
4. **Themeable**: Icons automatically use `var(--col-icons)` color from the theme
5. **Accessible**: Standard icons that users recognize from other applications

## License

Material Symbols are available under the [Apache License Version 2.0](https://www.apache.org/licenses/LICENSE-2.0.html), which is compatible with the GPL-3.0 license of this project.

## Testing

Build the project and check the theme toggle button:
```bash
npm run build
```

The button will show:
- 🌙 **Moon icon** when in light mode (click to switch to dark)
- ☀️ **Sun icon** when in dark mode (click to switch to light)
