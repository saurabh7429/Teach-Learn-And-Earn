# Without Log-in Dashboard

    ┌──────────────────────────────────────────────┐
    │ Teach, Learn & Earn                          │
    │                                              │
    │ Home   Learn   Teach   Profile               │
    ├──────────────────────────────────────────────┤
    │                                              │
    │ Welcome, Saurav 👋                           │
    │                                              │
    │ What do you want to do?                      │
    │                                              │
    │  📚 LEARN                                    │
    │  Find teachers and learn new skills          │
    │                                              │
    │  🎓 TEACH                                    │
    │  Share your skills with others               │
    │                                              │
    └──────────────────────────────────────────────┘


# Logged-in Dashboard

    ┌─────────────────────────────────────────────────────────────────────┐
    │                                                                     │
    │  TL&E   Teach, Learn & Earn                                         │
    │                                                                     │
    │  Home    Learn    Teach    Progress    Requests    🔔    Saurav ▾   │ ( saurav is a profile )
    │                                                                     │
    ├─────────────────────────────────────────────────────────────────────┤
    │                                                                     │
    │  Good Morning, Saurav 👋                                            │
    │  What would you like to do today?                                   │
    │                                                                     │
    │   ┌────────────────────────────┐   ┌────────────────────────────┐   │
    │   │                            │   │                            │   │
    │   │       📚 LEARN             │   │       🎓 TEACH             │   │
    │   │                            │   │                            │   │
    │   │   Find teachers and        │   │   Share your knowledge     │   │
    │   │   learn new skills         │   │   with others              │   │
    │   │                            │   │                            │   │
    │   │   [ Explore Skills → ]     │   │   [ Teaching → ]           │   │
    │   │                            │   │                            │   │
    │   └────────────────────────────┘   └────────────────────────────┘   │
    │                                                                     │
    ├─────────────────────────────────────────────────────────────────────┤
    │                                                                     │
    │  Continue Learning                              [ View All → ]      │
    │                                                                     │
    │  ┌───────────────────────────────────────────────────────────────┐  │
    │  │ JavaScript                                                    │  │
    │  │ Teacher: Rahul                                                │  │
    │  │ ███████████████░░░░░░░░  65%                                  │  │
    │  │ [ Continue Learning → ]                                       │  │
    │  └───────────────────────────────────────────────────────────────┘  │
    │                                                                     │
    ├─────────────────────────────────────────────────────────────────────┤
    │                                                                     │
    │  Your Teaching                                                      │
    │                                                                     │
    │  ┌─────────────────┐  ┌────────────────┐  ┌──────────────────────┐  │ 
    │  │ C Programming   │  │ HTML           │  │ + Add New Skill      │  │
    │  │ ✓ Verified      │  │ ✓ Verified     │  │                      │  │
    │  │ 3 Students      │  │ 1 Student      │  │ Become a teacher     │  │
    │  └─────────────────┘  └────────────────┘  └──────────────────────┘  │
    │                                                                     │
    ├─────────────────────────────────────────────────────────────────────┤
    │                                                                     │
    │  Recent Activity                                                    │
    │                                                                     │
    │  • Rahul sent you a learning request                          2h    │
    │  • You completed JavaScript lesson                            5h    │
    │  • Your C Programming skill was verified                      1d    │
    │                                                                     │
    └─────────────────────────────────────────────────────────────────────┘


## Top Navbar

    ┌────────────────────────────────────────────────────────────────────┐
    │ TL&E     Home    Learn    Teach    Progress    Requests     🔔  👤 │
    └────────────────────────────────────────────────────────────────────┘

## learn 

### Learner workspace.

    Learn
    ├── Explore Skills
    ├── My Learning
    ├── Requests
    ├── Active Learning
    └── What he was Learning will looks here ( chats )

### Learn Page Design
    ┌──────────────────────────────────────────────────────────────┐
    │ Learn                                                        │
    │ Find skills, connect with teachers and continue learning.    │
    ├──────────────────────────────────────────────────────────────┤
    │                                                              │
    │ 🔍 Search skills                                             │
    │                                                              │
    │ My Learning                                                  │
    │                                                              │
    │ ┌────────────────────────────────────────────────────────┐   │
    │ │ JavaScript                                             │   │
    │ │ Teacher: Rahul                                         │   │
    │ │ Progress: ███████████████░░░░  70%                     │   │
    │ │                                                        │   │
    │ │ [ Continue Learning ]        [ 💬 Chat ]               │   │
    │ └────────────────────────────────────────────────────────┘   │
    │                                                              │
    │ ┌────────────────────────────────────────────────────────┐   │
    │ │ React                                                  │   │
    │ │ Teacher: Priya                                         │   │
    │ │ Progress: ████████░░░░░░░░░  40%                       │   │
    │ │                                                        │   │
    │ │ [ Continue Learning ]        [ 💬 Chat ]               │   │
    │ └────────────────────────────────────────────────────────┘   │
    │                                                              │
    │                      🤖 Teach Devta                          │
    │                                                              │
    │ Need help learning?                                          │
    │ [ Ask Teach Devta ]                                          │
    │                                                              │
    └──────────────────────────────────────────────────────────────┘

### Chat ka actual flow
          Learn
            ↓
        My Learning
            ↓
        JavaScript
            ↓
         [ Chat ]
            ↓
    JavaScript Learning Chat

### Chat Header

    ┌──────────────────────────────────────────────┐
    │ ← JavaScript                                 │
    │   Learning with Rahul                        │
    ├──────────────────────────────────────────────┤
    │                                              │
    │ Rahul: Today's topic is functions...         │
    │                                              │
    │ You: I have a question...                    │
    │                                              │
    ├──────────────────────────────────────────────┤
    │ Type a message...                   🔗[Send] │
    └──────────────────────────────────────────────┘

    - send button 
    - document attatch button

## Teach

### Teacher workspace.
    Teach
    ├── My Skills
    ├── Student Requests
    ├── My Students
    ├── Teaching
    └── What he was teaching will looks here ( chats )

### Teach Page Design

    ┌──────────────────────────────────────────────────────────────┐
    │ Teach                                                        │
    │ Share your knowledge with learners.                          │
    ├──────────────────────────────────────────────────────────────┤
    │                                                              │
    │ My Teaching Skills                                           │
    │                                                              │
    │ ┌────────────────────────────────────────────────────────┐   │
    │ │ C Programming ✓ Verified                               │   │
    │ │ 3 Active Students                                      │   │
    │ │                                                        │   │
    │ │ [ Manage ]      [ 👥 Students ]       [ 💬 Chats ]     │   │
    │ └────────────────────────────────────────────────────────┘   │
    │                                                              │
    │ ┌────────────────────────────────────────────────────────┐   │
    │ │ HTML ✓ Verified                                        │   │
    │ │ 1 Active Student                                       │   │
    │ │                                                        │   │
    │ │ [ Manage ]      [ 👥 Students ]       [ 💬 Chats ]     │   │
    │ └────────────────────────────────────────────────────────┘   │
    │                                                              │
    │ [+ Add Skill]                                                │
    │                                                              │
    └──────────────────────────────────────────────────────────────┘

### yahan Chats ko skill ke andar rakhna aur bhi better ho sakta hai.

For example:
          Teach
            ↓
       C Programming
            ↓
        My Students
            ↓
          Rahul
            ↓
         [ Chat ]

Then teacher clearly knows:

Rahul → C Programming → communication

## Teach Devta

## Progress
    - progress of both side looks here.

    Learning Progress ( for all )
    Teaching Progress ( for all )


## Profile
    this section will have locked, we will design it letter










## Example

            Saurav
            ├── Learning
            │   ├── JavaScript
            │   └── React
            │
            └── Teaching
                ├── C Programming ✓
                └── HTML ✓

