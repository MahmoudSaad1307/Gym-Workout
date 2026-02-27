
# 🏋️ GymTracker Pro — Premium Gym Tracker PWA

## Design Foundation
- Deep dark theme with backgrounds using very dark greys (#0A0A0A, #141414, #1A1A1A)
- Burgundy accent (#5A0E21) for active states, primary buttons, toggles
- Mobile-first layout with sticky bottom navigation bar (3 tabs)
- Framer Motion for page transitions, card animations, and list reordering
- Install `framer-motion` and `zustand` packages

## State Management (Zustand + localStorage)
- Single Zustand store with `persist` middleware saving to localStorage
- State includes: exercises by split, workout logs, current workout, unit preference (lbs/kgs), selected date
- Seed default exercises for Push, Pull, and Arms & Core splits on first load

## Exercise Images
- Curate real gym/exercise photos from Unsplash (free, no API key needed) for each of the 23 default exercises
- Display as thumbnails on exercise cards for visual identification
- Images stored as URLs in the exercise data

## Page 1: Log Workout (Home Tab)
- Date picker defaulting to today
- Split selector (Push / Pull / Arms & Core) as segmented toggle
- **Cardio Section**: Treadmill inputs for Time (mins), Distance (km), Calories
- **Unit Toggle**: Global lbs ↔ kgs switch in the header area
- **Weightlifting Section**: Exercise cards with real photos, showing set rows (Reps + Weight inputs), "Add Set" button per exercise
- Prominent burgundy "Complete & Save Workout" button at bottom

## Page 2: History (Chronological Feed)
- Scrollable feed of past workouts, newest first
- Each entry shows date, split type, and summary stats
- Tap to expand showing full treadmill stats + all exercises with sets/reps/weights
- Framer Motion expand/collapse animations

## Page 3: Exercise Management Dashboard
- List exercises grouped by split
- Add new exercise via shadcn Drawer/Dialog (with name input + split selector)
- Edit exercise names inline or via modal
- Delete exercises with confirmation dialog
- Each exercise shows its photo thumbnail

## Bottom Navigation Bar
- Fixed bottom bar with 3 tabs: Log Workout, History, Manage Exercises
- Lucide icons with burgundy highlight on active tab
- Smooth tab transitions with Framer Motion

## PWA Touches
- Rounded cards, smooth transitions, haptic-like button feedback
- Safe area padding for mobile notches
- Overall native-app feel
