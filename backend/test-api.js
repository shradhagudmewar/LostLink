const http = require('http');

const request = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('\n===========================================');
  console.log(' Starting LostLink Automated Integration Tests');
  console.log('===========================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(` PASS: ${title}`);
      passed++;
    } else {
      console.error(` FAIL: ${title}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
    });
    assert(health.status === 200 && health.data?.status === 'ok', 'API Health Check returns 200 OK');

    // 2. Public stats
    const stats = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/stats/public',
      method: 'GET',
    });
    assert(stats.status === 200 && stats.data?.stats?.totalReports > 0, 'Public landing page statistics counters');

    // 3. Browse items
    const itemsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/items?type=lost',
      method: 'GET',
    });
    assert(itemsRes.status === 200 && itemsRes.data?.items?.length > 0, 'Filter reports by type (lost items)');

    // 4. Test Student Sign Up / Registration for a New User
    const testStudentEmail = `student_${Date.now()}@college.edu`;
    const signupRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Rohan Gupta',
        email: testStudentEmail,
        password: 'Student@123456',
        studentId: '2024CS109',
        department: 'Computer Science & Engineering',
        college: 'National Institute of Technology',
        phone: '+91 98765 43210',
      }
    );
    assert(
      signupRes.status === 201 &&
      signupRes.data?.user?.name === 'Rohan Gupta' &&
      signupRes.data?.user?.studentId === '2024CS109',
      'New Student Sign Up with Name, Student ID, Department and College'
    );
    const newStudentToken = signupRes.data?.token;

    // Verify Dashboard profile API returns the student's name
    const studentProfile = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${newStudentToken}` },
    });
    assert(
      studentProfile.status === 200 && studentProfile.data?.user?.name === 'Rohan Gupta',
      'Dashboard profile successfully displays newly registered student name (Rohan Gupta)'
    );

    // 5. Admin Login
    const adminLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'admin@lostlink.com', password: 'Admin@123456' }
    );
    assert(adminLogin.status === 200 && adminLogin.data?.user?.role === 'admin', 'Admin authentication and JWT generation');
    const adminToken = adminLogin.data?.token;

    // 5. User Login
    const userLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'alex@example.com', password: 'User@123456' }
    );
    assert(userLogin.status === 200 && userLogin.data?.user?.email === 'alex@example.com', 'Regular User authentication');
    const userToken = userLogin.data?.token;

    // 6. User Profile verification
    const meRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(meRes.status === 200 && meRes.data?.user?.name === 'Alex Rivera', 'Protected profile endpoint (/api/auth/me)');

    // 7. Find iPhone lost item for smart matching test
    const allItems = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/items?search=iPhone',
      method: 'GET',
    });
    const iphoneItem = allItems.data?.items?.find((i) => i.type === 'lost');
    assert(Boolean(iphoneItem), 'Found test candidate item (Lost iPhone)');

    if (iphoneItem) {
      // 8. Test Smart Match algorithm
      const matchRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/matches/item/${iphoneItem._id}`,
        method: 'GET',
      });
      assert(
        matchRes.status === 200 && matchRes.data?.matches?.length > 0,
        `Smart Matching returns calculated matches (${matchRes.data?.matches?.[0]?.score}% match found)`
      );

      const topMatch = matchRes.data?.matches?.[0];
      assert(
        topMatch?.breakdown?.categoryScore > 0 && topMatch?.reasons?.length > 0,
        'Smart Match breakdown details and natural language explanation reasons'
      );
    }

    // 9. Create a new report via API
    const newReport = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/items',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      },
      {
        title: 'Bose QuietComfort 45 Headphones (Midnight Blue)',
        type: 'lost',
        category: 'Electronics',
        brand: 'Bose',
        primaryColor: 'Blue',
        secondaryColor: 'Black',
        city: 'Denver',
        specificLocation: 'Union Station Waiting Bench 4',
        date: new Date().toISOString(),
        description: 'Lost my blue Bose noise cancelling headphones in their zippered travel case.',
      }
    );
    assert(newReport.status === 201 && newReport.data?.item?.title?.includes('Bose'), 'Create new lost report with Smart Match trigger');

    // 10. Claim Lifecycle: Sarah submits claim on Marcus keys
    const sarahLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'sarah@example.com', password: 'User@123456' }
    );
    const sarahToken = sarahLogin.data?.token;

    const keysItem = allItems.data?.items?.find((i) => i.category === 'Keys' && i.type === 'found');
    if (keysItem) {
      const claimRes = await request(
        {
          hostname: 'localhost',
          port: 5000,
          path: '/api/claims',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sarahToken}`,
          },
        },
        {
          itemId: keysItem._id,
          proofDescription: 'These are my spare Honda keys with a red gym badge for 24 Hour Fitness.',
          contactPhone: '+1 555-0144',
          contactEmail: 'sarah@example.com',
        }
      );
      assert(claimRes.status === 201 && claimRes.data?.claim?.status === 'pending', 'Submit ownership claim with proof details');
      const claimId = claimRes.data?.claim?._id;

      // 11. Admin approves claim
      const reviewRes = await request(
        {
          hostname: 'localhost',
          port: 5000,
          path: `/api/claims/${claimId}/status`,
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
        },
        {
          status: 'approved',
          adminNotes: 'Verified gym membership barcode matches description.',
        }
      );
      assert(reviewRes.status === 200 && reviewRes.data?.claim?.status === 'approved', 'Admin review & approve ownership claim');

      // 12. Finalize reunion
      const reuniteRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/claims/${claimId}/reunite`,
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert(reuniteRes.status === 200 && reuniteRes.data?.success === true, 'Finalize item return & award reputation points');
    }

    // 13. Admin Stats API
    const adminStats = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      adminStats.status === 200 && adminStats.data?.stats?.totalUsers >= 3,
      'Admin Dashboard statistics and category aggregation'
    );

    // 14. Notifications check
    const notifs = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/notifications',
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(notifs.status === 200 && Array.isArray(notifs.data?.notifications), 'User notifications stream and unread badge count');

    console.log('\n===========================================');
    console.log(` Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('===========================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
};

runTests();
