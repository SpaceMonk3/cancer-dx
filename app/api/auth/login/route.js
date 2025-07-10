import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Demo authentication - replace with real authentication
    const validCredentials = [
      { email: 'doctor@demo.com', password: 'password123', name: 'Dr. Smith' },
      { email: 'admin@cancerdx.com', password: 'admin123', name: 'Admin User' },
      { email: 'researcher@university.edu', password: 'research123', name: 'Dr. Johnson' }
    ];

    const user = validCredentials.find(
      cred => cred.email === email && cred.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, 
        { status: 401 }
      );
    }

    // Generate a simple token (in production, use proper JWT)
    const token = Buffer.from(`${user.email}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      success: true,
      token,
      user_id: user.email,
      email: user.email,
      name: user.name
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}