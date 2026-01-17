import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/types/user';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');
    
    // Check if current user is admin
    const adminUser = await usersCollection.findOne({ 
      email: currentUser.email,
      isAdmin: true 
    });

    if (!adminUser) {
      return NextResponse.json({ 
        error: 'Forbidden - Admin access required' 
      }, { status: 403 });
    }

    const { userId, isAdmin } = await request.json();

    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    // Update user's admin status
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) as unknown as string },
      { $set: { isAdmin: !!isAdmin } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: `User ${isAdmin ? 'promoted to' : 'removed from'} admin` 
    });
  } catch (error) {
    console.error('Error toggling admin status:', error);
    return NextResponse.json(
      { error: 'Failed to update admin status' },
      { status: 500 }
    );
  }
}
