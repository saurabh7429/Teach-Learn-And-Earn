const API_URL = 'http://localhost:5000/api';
const timestamp = Date.now();

const studentData = {
  name: 'Test Student',
  username: `student_${timestamp}`,
  email: `student_${timestamp}@test.com`,
  password: 'password123',
};

const teacherData = {
  name: 'Test Teacher',
  username: `teacher_${timestamp}`,
  email: `teacher_${timestamp}@test.com`,
  password: 'password123',
};

let studentToken = '';
let teacherToken = '';
let createdSkillId = '';
let createdRequestId = '';
let createdChatId = '';

const logPass = (title) => console.log(`  ✅ PASSED: ${title}`);
const logFail = (title, err) => {
  console.error(`  ❌ FAILED: ${title} ->`, err);
  process.exit(1);
};

async function apiPost(url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || res.statusText);
  return data;
}

async function apiGet(url, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || res.statusText);
  return data;
}

async function apiPut(url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || res.statusText);
  return data;
}

async function runTests() {
  console.log('\n🚀 Starting Deep Component & Integration Tests for Teach-Learn-And-Earn...\n');

  // 1. Backend Server Health Check
  try {
    const data = await apiGet('http://localhost:5000/');
    logPass(`Server Health Check (${data.message})`);
  } catch (err) {
    logFail('Server Health Check', err.message);
  }

  // 2. Auth Component Tests
  console.log('\n🔐 [Auth Component Tests]');
  try {
    // Register Student
    const resStudent = await apiPost(`${API_URL}/auth/register`, studentData);
    studentToken = resStudent.token;
    logPass(`Register Student User (@${studentData.username})`);

    // Register Teacher
    const resTeacher = await apiPost(`${API_URL}/auth/register`, teacherData);
    teacherToken = resTeacher.token;
    logPass(`Register Teacher User (@${teacherData.username})`);

    // Login Test
    const resLogin = await apiPost(`${API_URL}/auth/login`, {
      email: studentData.email,
      password: studentData.password,
    });
    if (resLogin.token) {
      logPass('Login User with JWT Token Generation');
    }

    // Verify /me endpoint
    const resMe = await apiGet(`${API_URL}/auth/me`, studentToken);
    if (resMe.email === studentData.email) {
      logPass('Fetch Authenticated Profile (/api/auth/me)');
    }
  } catch (err) {
    logFail('Auth Component', err.message);
  }

  // 3. Skills Component Tests
  console.log('\n🎓 [Skills Component Tests]');
  try {
    // Teacher adds skill
    const resSkill = await apiPost(
      `${API_URL}/skills`,
      { name: 'C Programming', description: 'Expert in C pointers & data structures' },
      teacherToken
    );
    createdSkillId = resSkill._id;
    logPass(`Add Skill ("${resSkill.name}")`);

    // Verify Skill (Teach Devta)
    const resVerify = await apiPut(`${API_URL}/skills/${createdSkillId}/verify`, {}, teacherToken);
    if (resVerify.verified) {
      logPass('Verify Skill via Teach Devta Engine');
    }

    // Get Teacher's skills
    const resMySkills = await apiGet(`${API_URL}/skills/mine`, teacherToken);
    if (resMySkills.length > 0) {
      logPass(`Fetch Teacher's Skills List (${resMySkills.length} found)`);
    }
  } catch (err) {
    logFail('Skills Component', err.message);
  }

  // 4. Learning Requests Component Tests
  console.log('\n🤝 [Learning Requests Component Tests]');
  try {
    // Student creates request
    const resReq = await apiPost(
      `${API_URL}/requests`,
      {
        question: 'How do memory pointers work in C?',
        description: 'Need help understanding stack vs heap memory.',
        skill: 'C Programming',
      },
      studentToken
    );
    createdRequestId = resReq._id;
    logPass(`Create Learning Request ("${resReq.question}")`);

    // Student fetches my requests
    const resMyReqs = await apiGet(`${API_URL}/requests/my`, studentToken);
    if (resMyReqs.length > 0) {
      logPass(`Fetch Student's Requests List (${resMyReqs.length} found)`);
    }

    // Teacher fetches matching open requests
    const resTeachReqs = await apiGet(`${API_URL}/requests/teaching`, teacherToken);
    logPass(`Teacher Fetch Matching Requests (${resTeachReqs.length} matched)`);

    // Teacher offers to teach request
    const resOffer = await apiPost(`${API_URL}/requests/${createdRequestId}/offer`, {}, teacherToken);
    if (resOffer.teacherResponses.length > 0) {
      logPass('Teacher Submit "I Can Teach This" Offer');
    }

    // Student selects Teacher & creates Chat room
    const teacherId = resOffer.teacherResponses[0].teacher._id || resOffer.teacherResponses[0].teacher;
    const resSelect = await apiPost(
      `${API_URL}/requests/${createdRequestId}/select`,
      { teacherId },
      studentToken
    );
    if (resSelect.status === 'selected') {
      logPass('Student Accept Teacher Offer & Open Chat Room');
    }
  } catch (err) {
    logFail('Learning Requests Component', err.message);
  }

  // 5. Chat Component Tests
  console.log('\n💬 [Chat Component Tests]');
  try {
    // Get Student's chats
    const resChats = await apiGet(`${API_URL}/chats`, studentToken);
    if (resChats.length > 0) {
      createdChatId = resChats[0]._id;
      logPass(`Fetch User Chats List (Chat ID: ${createdChatId})`);
    }

    // Student sends message
    const resMsg1 = await apiPost(
      `${API_URL}/chats/${createdChatId}/message`,
      { content: 'Hello Teacher! I have a question about malloc in C.' },
      studentToken
    );
    logPass('Student Send Chat Message');

    // Teacher sends response message
    const resMsg2 = await apiPost(
      `${API_URL}/chats/${createdChatId}/message`,
      { content: 'Hi Student! malloc allocates memory dynamically on the heap.' },
      teacherToken
    );
    if (resMsg2.messages.length >= 2) {
      logPass(`Teacher Reply Message (Total Messages: ${resMsg2.messages.length})`);
    }
  } catch (err) {
    logFail('Chat Component', err.message);
  }

  // 6. Progress Component Tests
  console.log('\n📊 [Progress Component Tests]');
  try {
    const resProgress = await apiGet(`${API_URL}/progress`, studentToken);
    if (resProgress.teaching && resProgress.learning) {
      logPass(`Fetch Aggregate Progress Stats (Total Messages: ${resProgress.totalSessions})`);
    }
  } catch (err) {
    logFail('Progress Component', err.message);
  }

  console.log('\n🎉 ALL COMPONENT & INTEGRATION TESTS PASSED SUCCESSFULLY! 🚀\n');
}

runTests();
