import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/mongodb';
import { createToken, setAuthCookie } from '@/lib/auth';
import { User } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, registrationSecret } = await request.json();

    // Validate registration secret
    if (registrationSecret !== process.env.REGISTRATION_SECRETE_KEY) {
      return NextResponse.json(
        { error: 'Invalid registration secret' },
        { status: 403 }
      );
    }

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser: User = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    // Create JWT token
    const token = await createToken({
      userId: result.insertedId.toString(),
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    });

    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: result.insertedId.toString(),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
