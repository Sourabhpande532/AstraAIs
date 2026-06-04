const axios = require('axios');

async function testAstraHR() {
  try {
    console.log("1. Starting Browser Simulation...");
    console.log("2. Simulating User Clicking 'Login as Guest'...");
    
    // Test Guest Login
    const loginRes = await axios.post('http://localhost:5001/api/auth/guest');
    const token = loginRes.data.token;
    console.log(`✅ Logged in successfully! Welcome, ${loginRes.data.name}`);
    
    // Test Dashboard Load
    console.log("\n3. Loading Dashboard...");
    const dashRes = await axios.get('http://localhost:5001/api/hr/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Dashboard Loaded. Leave Balances:`, dashRes.data.user.leaveBalance);
    
    // Test AI RAG
    console.log("\n4. Simulating AI Chat: Asking about Maternity Leave (RAG Policy Check)...");
    const chatRes1 = await axios.post('http://localhost:5001/api/ai/chat', { message: "What is the maternity leave policy?" }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ AI Replied (Type: ${chatRes1.data.type}):`, chatRes1.data.reply);
    
    // Test AI Agentic Planner
    console.log("\n5. Simulating AI Chat: Requesting a complex action (Agentic Planning)...");
    const chatRes2 = await axios.post('http://localhost:5001/api/ai/chat', { 
      message: "Check my sick leave balance. If I have enough, apply for 1 day of sick leave because I have a fever, and then schedule a doctor's appointment meeting for tomorrow." 
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ AI Replied (Type: ${chatRes2.data.type}):`, chatRes2.data.reply);
    console.log(`🧠 AI Execution Plan:`, JSON.stringify(chatRes2.data.plan.plan, null, 2));
    
  } catch (error) {
    console.error("❌ Error during simulation:", error.response ? error.response.data : error.message);
  }
}

testAstraHR();
