import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const mockUsers = [
      {
        firstName: 'Alice',
        lastName: 'Wonder',
        email: 'alice@example.com',
        password: 'password123',
        role: 'user',
        profileColor: 'from-pink-500 to-rose-500',
        preferences: { theme: 'dark', notifications: true, language: 'fr' },
      },
      {
        firstName: 'Bob',
        lastName: 'Builder',
        email: 'bob@example.com',
        password: 'password123',
        role: 'user',
        profileColor: 'from-blue-500 to-cyan-500', 
        preferences: { theme: 'dark', notifications: true, language: 'fr' },
      },
      {
        firstName: 'Charlie',
        lastName: 'Chaplin',
        email: 'charlie@example.com',
        password: 'password123',
        role: 'admin',
        profileColor: 'from-yellow-500 to-orange-500',
        preferences: { theme: 'dark', notifications: true, language: 'fr' },
      },
    ];

    const createdUsers = [];

    for (const mock of mockUsers) {
      const existing = await User.findOne({ email: mock.email });
      if (!existing) {
        // Create user
        const hashedPassword = await bcrypt.hash(mock.password, 10);
        const newUser = await User.create({
            ...mock,
            password: hashedPassword
        });
        createdUsers.push(newUser);
      }
    }

    return NextResponse.json({ success: true, message: `Created ${createdUsers.length} users`, data: createdUsers });

  } catch (error) {
    console.error('Error seeding users:', error);
    return NextResponse.json({ success: false, error: 'Failed to seed users' }, { status: 500 });
  }
}
