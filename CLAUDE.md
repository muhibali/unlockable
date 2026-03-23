📱 Unlockable Mobile App – Planning Document
1. Overview
Unlockable is a mobile application that interfaces with a smart door lock system powered by an ESP32. The app allows users to view and control the lock through a finite state machine (FSM), ensuring clear, predictable behavior for all interactions.
The system is built around:
A state-driven architecture
Secure password-based access control
Real-time hardware communication

2. Core Concept: Finite State Machine (FSM)
The application is centered around a finite state machine that governs all behavior.
States
LOCKED – Default state, door is secured
UNLOCKED – Door is open/unlocked
ATTEMPT – User is entering a password
TIMEOUT – User is temporarily locked out after failed attempts
SET_PASSWORD – User is creating a new password
CONFIRM_PASSWORD – User confirms the new password

Transitions
LOCKED → ATTEMPT
 Trigger: User initiates unlock
ATTEMPT → UNLOCKED
 Trigger: Correct password
ATTEMPT → LOCKED
 Trigger: Incorrect password (under limit)
ATTEMPT → TIMEOUT
 Trigger: 3 failed attempts
TIMEOUT → LOCKED
 Trigger: Timeout duration expires
LOCKED → SET_PASSWORD
 Trigger: User enters password setup mode
SET_PASSWORD → CONFIRM_PASSWORD
 Trigger: User inputs new password
CONFIRM_PASSWORD → LOCKED
 Trigger: Password confirmed successfully

3. System Architecture
The system consists of three main layers:
1. Frontend (Mobile App)
Built with React Native
Displays current state
Handles user input
Sends commands to hardware

2. State Management (FSM Engine)
Controls valid transitions
Tracks attempts and timeout logic
Ensures system consistency

3. Hardware Layer (ESP32)
Executes physical locking/unlocking
Communicates with app via Bluetooth or WiFi
Sends back current state

4. Functional Requirements
State Display
App must always show the current lock state
State changes should be reflected instantly

User Input Handling
Users can:
Attempt unlock (enter password)
Set a new password
Input must trigger FSM transitions

Attempt Tracking
Track number of failed password attempts
After 3 failures, transition to TIMEOUT

Timeout Handling
Disable input during timeout
Display countdown timer
Automatically return to LOCKED after timeout

Password Management
Allow users to:
Create a new password
Confirm password before saving
Store password securely (hashed or on device)

Hardware Communication
Send commands:
LOCK
UNLOCK
Receive updates:
Current state
Status confirmations

5. Data Flow
App → Hardware
{
 "action": "UNLOCK"
}
{
 "action": "LOCK"
}

Hardware → App
{
 "state": "LOCKED"
}
{
 "state": "UNLOCKED"
}

6. FSM Logic (Core Engine)
The FSM should be implemented as a pure logic layer.
type State =
 | "LOCKED"
 | "UNLOCKED"
 | "ATTEMPT"
 | "TIMEOUT"
 | "SET_PASSWORD"
 | "CONFIRM_PASSWORD";

type Event =
 | "START_ATTEMPT"
 | "CORRECT_PASSWORD"
 | "WRONG_PASSWORD"
 | "TIMEOUT_COMPLETE"
 | "START_SET_PASSWORD"
 | "CONFIRM_PASSWORD";

function transition(state: State, event: Event): State {
 // Enforce valid transitions
}

7. UI Structure
Home Screen
Displays:
Lock icon (locked/unlocked)
Current state label
Primary actions:
Unlock
Lock
Set Password

Attempt Screen
Password input field or keypad
Submit button
Error feedback on failure

Timeout Screen
Countdown timer
Disabled interaction
Message indicating lockout

Set Password Flow
Input new password
Confirm password
Validation feedback

Optional: FSM Visualizer
Graph showing states and transitions
Highlight current state
Useful for debugging/demo

8. Security Considerations
Do not store passwords in plaintext
Limit attempts to prevent brute force
Enforce timeout after repeated failures
Validate all transitions through FSM (no direct state changes)

9. State Logic Rules
Attempt Handling
let attempts = 0;

if (passwordIncorrect) {
 attempts++;
}

if (attempts >= 3) {
 state = "TIMEOUT";
}

Timeout Reset
setTimeout(() => {
 state = "LOCKED";
 attempts = 0;
}, 60000);

10. Design Principles
State-driven UI: UI reflects FSM state at all times
Single source of truth: FSM controls all behavior
Minimal and clean UI: Black and white theme, SF Pro font
Hardware abstraction: App should function even without hardware (mock mode)

11. Tech Stack
React Native (Expo)
TypeScript
State management (Context API or Zustand)
Bluetooth Low Energy (BLE) for ESP32 communication

12. MVP Scope
Core Features
FSM implementation
State display UI
Password input + validation
Attempt tracking
Timeout logic
Lock/unlock simulation

Optional Enhancements
Hardware integration (ESP32)
Real-time sync
FSM visualization
Animations and transitions

13. Key Outcome
The final system demonstrates:
A working finite state machine in a real application
Integration between mobile software and embedded hardware
A clean, intuitive user interface driven by system state