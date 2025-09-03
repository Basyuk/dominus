# Progress Bars in Application

The application implements two types of progress bars to improve user experience during asynchronous operations.

## Components

### 1. ProgressBar

Universal component for displaying simple progress of operations.

**Props:**
- `isLoading` (boolean) - whether to show progress bar
- `message` (string) - message to display
- `showMessage` (boolean) - whether to show message (default true)
- `variant` (string) - progress type: 'indeterminate' or 'determinate'
- `progress` (number) - completion percentage (0-100)
- `showProgress` (boolean) - whether to show completion percentage
- `type` (string) - display type: 'linear' or 'circular'

**Usage example:**
```jsx
<ProgressBar 
  isLoading={statusesLoading} 
  message="Updating service statuses..." 
  type="circular"
/>
```

### 2. BulkProgressBar

Specialized component for displaying progress of bulk operations with detailed statistics.

**Props:**
- `isLoading` (boolean) - whether to show progress bar
- `totalItems` (number) - total number of items
- `completedItems` (number) - number of successfully completed items
- `failedItems` (number) - number of failed operations
- `currentItem` (string) - currently processed item
- `onComplete` (function) - callback on completion

**Usage example:**
```jsx
<BulkProgressBar 
  isLoading={bulkProgress.isLoading}
  totalItems={bulkProgress.totalItems}
  completedItems={bulkProgress.completedItems}
  failedItems={bulkProgress.failedItems}
  currentItem={bulkProgress.currentItem}
/>
```

## Application Integration

### Status Updates

When "Update Statuses" button is clicked, a simple progress bar is shown with message "Updating service statuses...".

### Priority Change

When changing priority of individual service:
1. Button becomes inactive and shows "Processing..."
2. Loading indicator is displayed in button
3. Progress bar is shown with message "Changing service priority..."

### Bulk Update

When performing bulk priority updates:
1. Detailed progress bar is shown
2. Statistics are displayed: successful/errors/pending
3. Currently processed service is shown
4. Final result is displayed upon completion

## States in useServices Hook

```javascript
// Progress states
const [statusesLoading, setStatusesLoading] = useState(false);
const [priorityLoading, setPriorityLoading] = useState(false);
const [bulkProgress, setBulkProgress] = useState({
  isLoading: false,
  totalItems: 0,
  completedItems: 0,
  failedItems: 0,
  currentItem: '',
  results: []
});
```

## Demo

To test progress bars, you can use the `ProgressDemo` component:

```jsx
import { ProgressDemo } from './components';

// In your component
<ProgressDemo />
```

## Styling

Progress bars use Material-UI components and support:
- Responsive design
- Show/hide animations
- Different colors for different states
- Backdrop blur effect
- Centered positioning

## Logging

All progress bar operations are logged for debugging:
- Operation start
- Successful completion
- Errors
- Execution statistics