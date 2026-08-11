# Teach, Learn & Earn
# One account → can Learn + can Teach simultaneously.

## architecture

                    USER ACCOUNT
                         │
             ┌───────────┴───────────┐
             │                       │
        LEARNER MODE             TEACHER MODE
             │                       │
       Learn Skills             Teach Skills
       Send Requests            Receive Requests
       My Courses               My Students
       Progress                 Earnings

## main design flow

                    LOGIN
                      │
                      ↓
                COMMON HOME
                      │
              ┌───────┴────────┐
              ↓                ↓
           LEARN             TEACH
              │                │
       Learner Workspace   Teacher Workspace
              │                │
       Find Teachers       Manage Skills
       Send Requests       Student Requests
       My Learning         My Students
       Progress            Teaching
                          Earnings


## Login page

    ┌─────────────────────────────────────────────────────────────┐
    │                                                             │
    │   LEFT — BRANDING                 RIGHT — FORM              │
    │                                                             │
    │   Teach, Learn & Earn             Welcome Back 👋           │
    │                                                             │
    │   Learn what you love.            ┌───────────────────────┐ │
    │   Teach what you know.            │ Email                 │ │
    │                                   │ [___________________] │ │
    │   ┌───────────────────────┐       │                       │ │
    │   │ Learn  ↔  Teach       │       │ Password              │ │
    │   └───────────────────────┘       │ [___________________] │ │
    │                                   │                       │ │
    │   Everyone can learn.             │ Forgot password?      │ │
    │   Everyone can teach.             │                       │ │
    │   etc...                          │ [       Login       ] │ │
    │                                   │                       │ │
    │                                   │ ─────── OR ─────────  │ │
    │                                   │                       │ │
    │                                   │ Don't have account?   │ │
    │                                   │ Create Account        │ │
    │                                   └───────────────────────┘ │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘

### Left side ko sirf "About Us" jaisa paragraph mat banana.

    Iska purpose hai 30 seconds me website ka concept samjhana.

    Logo

    Top-left:

    TL&E logo / icon

    Then:

    Teach, Learn & Earn

    Short tagline:

    Learn what you love. Teach what you know.

    Uske neeche 2–3 short points:

    📚 Learn from people with real skills
    🎓 Share your knowledge with others
    🚀 Grow and Earn by teaching and learning

#### Visual
 - simple illustration

            👨‍🎓
          LEARN
            ↓
        💡 SKILL
            ↓
          TEACH
            ↓
        🚀 GROW

 - two-person illustration:
     Learner  ←────→  Teacher
          \            /
           \   Skill  /
              Exchange

### 3. Right Side — Login

Heading:

Welcome Back 👋

Subheading:

Login to continue your learning journey.

Fields

Email

[ Enter your email ]

Password

[ Enter your password 👁 ]

Password me 👁 toggle hona chahiye.

Forgot Password

Password ke neeche/right:

Forgot password?

Clickable.

Login button

Full-width:

Login

Button prominent hona chahiye.

### 4. Signup Link

Form ke bottom:

Don't have an account?

Create Account

## Responsive Design

    Desktop:

    50%                 50%
    LEFT                RIGHT

- Mobile par left section completely disappear nahi karna, but compact kar dena:

    ┌─────────────────────┐
    │     TL&E Logo       │
    │                     │
    │ Teach, Learn & Earn │
    │ Learn what you love │
    │                     │
    ├─────────────────────┤
    │ Welcome Back 👋     │
    │                     │
    │ Email               │
    │ [_______________]   │
    │                     │
    │ Password            │
    │ [_______________]   │
    │                     │
    │ [     Login      ]  │
    │                     │
    │ Create Account      │
    └─────────────────────┘

Desktop par visual-heavy, mobile par form-focused.