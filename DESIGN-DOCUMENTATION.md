# Banana Tracker - Design Documentation

## 1. Design System Overview

### 1.1 Design Philosophy

The Banana Tracker application follows a clean, functional design philosophy that prioritizes:

- **Clarity**: Information is presented clearly with appropriate visual hierarchy
- **Efficiency**: Tasks can be completed with minimal steps
- **Consistency**: UI patterns are consistent throughout the application
- **Accessibility**: The application is usable by people with diverse abilities
- **Responsiveness**: The interface adapts seamlessly to different screen sizes

### 1.2 Core Design Principles

1. **User-Centered Design**: All features are designed with the farm manager's workflow in mind
2. **Progressive Disclosure**: Complex information is revealed progressively to avoid overwhelming users
3. **Visual Hierarchy**: Important information and actions are visually emphasized
4. **Contextual Actions**: Actions are presented in context where they are needed
5. **Feedback Loops**: Users receive clear feedback for their actions

## 2. Brand Identity

### 2.1 Logo & Iconography

- **Primary Logo**: Leaf icon paired with "Farm Manager" text
- **Icon System**: Lucide React icons for consistency across the application
- **Icon Usage**: Icons are used to enhance recognition and provide visual cues, always paired with text labels for clarity

### 2.2 Color System

#### Primary Colors

- **Primary**: Green (`#10b981`) - Used for primary actions, active states, and key indicators
- **Primary Foreground**: White (`#ffffff`) - Text on primary color backgrounds

#### Secondary Colors

- **Secondary**: Light gray (`#f3f4f6`) - Used for secondary UI elements
- **Secondary Foreground**: Dark gray (`#1f2937`) - Text on secondary color backgrounds

#### Semantic Colors

- **Success**: Green (`#10b981`) - Indicates successful operations or healthy status
- **Warning**: Yellow (`#eab308`) - Indicates warnings or items needing attention
- **Danger**: Red (`#ef4444`) - Indicates errors or critical issues
- **Info**: Blue (`#3b82f6`) - Indicates informational content

#### Neutral Colors

- **Background**: White (`#ffffff`) - Main background color
- **Foreground**: Dark gray (`#1f2937`) - Main text color
- **Muted**: Light gray (`#9ca3af`) - Secondary text, borders, and dividers
- **Accent**: Light green (`#d1fae5`) - Subtle highlights and accents

### 2.3 Typography

- **Primary Font**: Inter - A clean, modern sans-serif font
- **Heading Sizes**:
  - H1: 24px/1.5 (36px line height), font-weight: 700
  - H2: 20px/1.5 (30px line height), font-weight: 700
  - H3: 18px/1.5 (27px line height), font-weight: 600
  - H4: 16px/1.5 (24px line height), font-weight: 600
- **Body Text**: 14px/1.5 (21px line height), font-weight: 400
- **Small Text**: 12px/1.5 (18px line height), font-weight: 400

## 3. Component Library

### 3.1 Core Components

#### Layout Components

- **Header**: Contains navigation, search, and user profile
- **Sidebar**: Contains primary navigation (desktop only)
- **Mobile Navigation**: Bottom navigation bar for mobile devices
- **Container**: Maintains consistent content width and padding
- **Card**: Container for related content with consistent styling

#### Input Components

- **Button**: Primary, secondary, outline, ghost, and link variants
- **Input**: Text input fields with consistent styling
- **Select**: Dropdown selection fields
- **Checkbox**: Toggle for boolean values
- **Radio**: Selection from mutually exclusive options
- **Switch**: Toggle for enabling/disabling features
- **Textarea**: Multi-line text input
- **Date Picker**: Calendar-based date selection

#### Display Components

- **Badge**: Small status indicators
- **Alert**: Contextual feedback messages
- **Toast**: Temporary notifications
- **Modal**: Focused interaction overlays
- **Tabs**: Content organization into tabbed interfaces
- **Accordion**: Collapsible content sections
- **Table**: Structured data display
- **Charts**: Data visualization (bar, line, pie)

### 3.2 Composite Components

- **Farm Card**: Displays farm summary information
- **Plot Card**: Displays plot summary information
- **Task Card**: Displays task information with status
- **Stats Card**: Displays key metrics with icons
- **Team Member Card**: Displays team member information
- **Knowledge Card**: Displays knowledge base articles

### 3.3 Component Guidelines

- **Spacing**: Use consistent spacing (4px increments)
- **Borders**: 1px with border-radius of 6px (0.375rem)
- **Shadows**: Consistent shadow styles for elevated elements
- **States**: Clear visual indicators for hover, focus, active, and disabled states

## 4. Information Architecture

### 4.1 Navigation Structure

#### Primary Navigation

- Dashboard
- Farms
- Tasks
- Growth
- Reports

#### Secondary Navigation

- Team
- Knowledge
- Owner Dashboard
- Settings

### 4.2 Page Hierarchy

1. **Dashboard**: Overview of farm operations
2. **Farms**: List of farms → Farm details → Plot details → Row management
3. **Tasks**: Task list → Task details
4. **Growth**: Growth tracking → Growth stages → Harvest planning
5. **Reports**: Various report types
6. **Team**: Team members → Member details
7. **Knowledge**: Knowledge base articles
8. **Owner Dashboard**: Financial overview → Financial records → Buyers
9. **Settings**: Application settings

## 5. Page Layouts

### 5.1 Common Layout Patterns

#### Dashboard Layout

- Stats cards in grid (4 columns on desktop, 2 on tablet, 1 on mobile)
- Main content area (2/3 width) with secondary sidebar (1/3 width)
- Cards with consistent padding (16px)

#### List Layout

- Filter/search bar at top
- Grid of cards (3 columns on desktop, 2 on tablet, 1 on mobile)
- Add button in top-right corner

#### Detail Layout

- Breadcrumb navigation
- Header with title and actions
- Summary cards (3 columns)
- Tabbed content below

### 5.2 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### 5.3 Grid System

- 12-column grid on desktop
- 6-column grid on tablet
- Single column on mobile
- Consistent gutters (16px)

## 6. User Flows

### 6.1 Farm Management Flow

1. View farms list
2. Select farm to view details
3. View farm summary information
4. Navigate to plots tab
5. Select plot to view details
6. Navigate to row management
7. View rows in list or visual layout
8. Select row to view/manage holes
9. Add/edit rows or holes as needed

### 6.2 Task Management Flow

1. View tasks list
2. Filter tasks by status/farm
3. Select task to view details
4. Update task status
5. Add comments or attachments
6. Complete task

### 6.3 Growth Tracking Flow

1. Navigate to growth section
2. Select farm/plot
3. Record growth stage
4. View growth history
5. Plan harvest based on growth data

## 7. Interaction Patterns

### 7.1 Form Interactions

- **Inline Validation**: Immediate feedback for input errors
- **Progressive Disclosure**: Show only relevant fields based on previous selections
- **Smart Defaults**: Pre-populate fields with likely values
- **Contextual Help**: Provide guidance where needed with tooltips or info icons

### 7.2 Data Visualization Interactions

- **Tooltips**: Show detailed information on hover
- **Filtering**: Allow users to filter data views
- **Zooming**: Enable zooming for detailed exploration
- **Time Range Selection**: Allow users to adjust time periods

### 7.3 Mobile Interactions

- **Touch Targets**: Minimum 44x44px for touch targets
- **Swipe Actions**: Use swipe gestures for common actions
- **Bottom Sheet Dialogs**: Use for mobile-friendly forms
- **Pull to Refresh**: For updating content

## 8. Row & Hole Management Design

### 8.1 Row List View

- **Card-Based Layout**: Each row displayed as a card
- **Expandable Cards**: Click to expand and show holes
- **Quick Actions**: Edit row, manage holes
- **Visual Indicators**: Show row status at a glance

### 8.2 Visual Layout View

- **Canvas Visualization**: Shows spatial arrangement of rows and holes
- **Interactive Elements**: Click on holes to select
- **Color Coding**: Different colors for different hole statuses
- **Legend**: Explains color coding and symbols

### 8.3 Hole Management

- **Grid Layout**: Display holes in a grid for easy scanning
- **Status Indicators**: Color-coded circles for hole status
- **Health Indicators**: Small indicators for plant health
- **Bulk Actions**: Select multiple holes for batch operations

## 9. Accessibility Guidelines

### 9.1 Color Contrast

- Maintain minimum contrast ratios:
  - 4.5:1 for normal text
  - 3:1 for large text and UI components

### 9.2 Keyboard Navigation

- All interactive elements must be keyboard accessible
- Logical tab order
- Visible focus indicators

### 9.3 Screen Reader Support

- Semantic HTML structure
- Appropriate ARIA attributes
- Meaningful alt text for images
- Form labels for all inputs

### 9.4 Responsive Text

- Text should scale appropriately on different devices
- Minimum text size of 16px for body text

## 10. Implementation Guidelines

### 10.1 Component Usage

```tsx
// Example of proper component usage
<Card>
  <CardHeader>
    <CardTitle>Row 1</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-3 gap-2 text-sm">
      <div>
        <p className="text-muted-foreground">Length</p>
        <p className="font-medium">10 m</p>
      </div>
      <div>
        <p className="text-muted-foreground">Spacing</p>
        <p className="font-medium">2 m</p>
      </div>
      <div>
        <p className="text-muted-foreground">Holes</p>
        <p className="font-medium">5</p>
      </div>
    </div>
  </CardContent>
</Card>
```

### 10.2 Tailwind CSS Patterns

- Use utility classes consistently
- Follow naming conventions for custom classes
- Use the `cn()` utility for conditional classes

```tsx
// Example of proper Tailwind usage
<div className={cn(
  "aspect-square rounded-full flex items-center justify-center text-xs font-medium relative",
  getStatusColor(hole.status)
)}>
  {hole.holeNumber}
</div>
```

### 10.3 Responsive Design Implementation

```tsx
// Example of responsive design implementation
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <StatsCard title="Total Farms" value={farms.length} />
  <StatsCard title="Total Area" value={`${totalArea.toFixed(1)} acres`} />
  <StatsCard title="Active Tasks" value={activeTasks.length} />
  <StatsCard title="Health Concerns" value={healthCounts["Poor"] || 0} />
</div>
```

## 11. Data Visualization Guidelines

### 11.1 Chart Types and Usage

- **Bar Charts**: For comparing values across categories
- **Line Charts**: For showing trends over time
- **Pie/Donut Charts**: For showing proportions of a whole
- **Scatter Plots**: For showing relationships between variables

### 11.2 Chart Design Principles

- **Simplicity**: Focus on the data, minimize chart junk
- **Consistency**: Use consistent colors and styles
- **Clarity**: Clear labels and legends
- **Interactivity**: Tooltips for detailed information

### 11.3 Data Table Design

- **Sorting**: Allow sorting by columns
- **Filtering**: Provide filters for data tables
- **Pagination**: Break large datasets into pages
- **Row Actions**: Contextual actions for each row

## 12. Future Design Considerations

### 12.1 Dark Mode

- Implement a comprehensive dark mode theme
- Ensure sufficient contrast in dark mode
- Test all components in both light and dark modes

### 12.2 Internationalization

- Design with text expansion/contraction in mind
- Support right-to-left languages
- Use culturally neutral icons and imagery

### 12.3 Advanced Visualizations

- 3D plot visualizations
- Heatmaps for density visualization
- Timeline views for historical data

## 13. Design-to-Development Handoff

### 13.1 Component Specifications

- Detailed specifications for each component
- States (normal, hover, active, disabled)
- Responsive behavior
- Accessibility requirements

### 13.2 Design Tokens

- Colors
- Typography
- Spacing
- Shadows
- Border radii

### 13.3 Asset Management

- SVG icons
- Images
- Illustrations

## 14. Quality Assurance Checklist

- Consistent spacing and alignment
- Proper color usage according to guidelines
- Responsive behavior on all breakpoints
- Keyboard accessibility
- Screen reader compatibility
- Proper contrast ratios
- Consistent component usage
- Form validation patterns
- Loading states and error handling
- Animation and transition consistency

This comprehensive design documentation provides a solid foundation for creating a seamless UI/UX in the Banana Tracker application. By following these guidelines, the team can ensure consistency, usability, and accessibility across all aspects of the application.
