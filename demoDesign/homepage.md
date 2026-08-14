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

    - AI sirf ek random chatbot nahi hona chahiye.

    Uske 2 clearly separated responsibilities hain:

### Learn Side

    - Teach Devta = Learning Assistant

#### flow :
           Student
              ↓
           Learn
              ↓
          JavaScript
              ↓
          Need Help?
              ↓
         Teach Devta

#### Student Work With AI:

    Concept samajh sakta hai
    Questions pooch sakta hai
    Examples maang sakta hai
    Practice questions kar sakta hai
    Apni learning me help le sakta hai

### Teach Side

    Teach Devta = Skill Qualification Examiner

#### flow:

                       Teacher
                          ↓
                        Teach
                          ↓
                      Add Skill
                          ↓
              Select Skill/your unique skill
                          ↓
                 Teach Devta Assessment
                          ↓
                      5 Questions
                          ↓
                    AI evaluates answers
                          ↓
            PASS / FAIL - judgement by Teach Devta


Pass:

✓ C Programming
  Verified by Teach Devata

Fail:

✗ Assessment not passed

You can try again later.

### ⚠️ Lekin yahan ek important design decision hai

Teach Devata ko Learn page aur Teach page me same visual component ke roop me mat dikhana.

Function same AI hai, but context different hai.

#### Learn

    🤖 Teach Devata

    Your personal learning assistant

    [ Ask Teach Devata ]

#### Teach

    🤖 Teach Devata Assessment

    Verify your knowledge before
    you start teaching.

    [ Start Assessment ]

    This distinction is important.

## Requests

    website ka core actually ye nahi hai:

    "Student ek subject/course choose kare aur teacher usko pura subject sikhaye."

    Balki:

    Student ko jo specific cheez seekhni hai, wo us specific learning need ke liye request create kare.

### For example:

    Student:
    "I want to understand how loops work in C."

    NOT:
    "I want to learn C Programming."

### Student flow

            Learn
              ↓
    My Learning / Find Something
              ↓
    [ + Create Learning Request ]

#### Request form:

┌──────────────────────────────────────────────┐
│ Create Learning Request                     │
├──────────────────────────────────────────────┤
│                                              │
│ What do you want to learn?                  │
│ [ How do loops work in C? ]                 │
│                                              │
│ Tell teachers what you want to understand   │
│ [________________________________________]   │
│ [________________________________________]   │
│                                              │
│ Skill / Technology                           │
│ [ C Programming ▼ ]                          │
│                                              │
│ [ Submit Request ]                            │
│                                              │
└──────────────────────────────────────────────┘


- but Skill/Technology is not mandatory yet, we will design it letter.

### Teacher side

- if he/her is capable he will click on.
    [ I Can Teach This ] 
- it doesnt open chat directly 
- Instead, it will send **teaching offer/request response** to the student


note :- teacher will see all requests in a infinite scrollable page.

#### teacher's will see this kind of request cards.

┌──────────────────────────────────────────────┐
│ Student wants to learn                       │
│                                              │
│ "How do loops work in C?"                    │
│                                              │
│ C Programming                                │
│                                              │
│ Posted by: Rahul                             │
│                                              │
│         [ I Can Teach This ]                 │
└──────────────────────────────────────────────┘

### Multiple Teachers ( response )

Suppose Rahul senmded request:

**"I want to understand loops in C."**

3 teachers are interested:

#### student can select perfect desigerd teacher by accepting request of that perticuler teacher.

Rahul's Learning Request

How do loops work in C?

3 teachers are willing to teach you.

┌─────────────────────────────────────────────┐
│ 👤 Saurav                                   │
│ C Programming ✓                             │
│ [ View Profile ]                            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 👤 Amit                                     │
│ C Programming ✓                             │
│ [ View Profile ]                            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 👤 Priya                                    │
│ C Programming ✓                             │
│ [ View Profile ]                            │
└─────────────────────────────────────────────┘


### 🔔 Notification

Teacher ne I Can Teach This click kiya:


#### flow:
            
           Student
             ↑
        Notification
             ↑
Teacher offered to teach your request


#### Student Notified:

3 teachers are willing to teach "How do loops work in C".

Also shown on Requests page.

Thats why notification only is an alert; actual decision taken on Requests page.

### Requests Page

**two sections**

Requests

┌──────────────────────┬───────────────────┐
│ My Learning Requests │ Teaching Requests │
└──────────────────────┴───────────────────┘

#### My Learning Requests

┌──────────────────────────────────────────────┐
│ How do loops work in C?                      │
│                                              │
│ 3 teachers are interested                    │
│                                              │
│ Status: Waiting for teacher selection        │
│                                              │
│ [ View Responses ]                           │
└──────────────────────────────────────────────┘

##### View Responses:

    How do loops work in C?

    3 Teachers

    Saurav       C Programming ✓
    Amit         C Programming ✓
    Priya        C Programming ✓

    [ View Profile ] [ Choose Teacher ]

#### Teaching Requests

Teaching Requests

Requests matching your skills

┌──────────────────────────────────────────────┐
│ How do loops work in C?                      │
│                                              │
│ Student: Rahul                               │
│                                              │
│ C Programming                                │
│                                              │
│ [ I Can Teach This ]                         │
└──────────────────────────────────────────────┘

- for every Request teacher have an an action 
 
    [ I Can Teach This ]


### Final flow

                 STUDENT
                    │
                    ↓
           Has something to learn
                    │
                    ↓
        + Create Learning Request
                    │
                    ↓
          Request appears to
          capable/verified teachers
                    │
          ┌─────────┼─────────┐
          ↓         ↓         ↓
       Teacher A Teacher B Teacher C
          │         │         │
          └─────────┼─────────┘
                    ↓
            Student gets
            notifications
                    │
                    ↓
          Views teacher offers
                    │
                    ↓
           Chooses ONE teacher
                    │
                    ↓
             Learning starts

- **mechanism** of **communication/session** comes after this 












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

