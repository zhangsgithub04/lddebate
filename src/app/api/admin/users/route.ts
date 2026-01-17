import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/types/user';

export async function GET(_request: NextRequest) {
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

    // Get all users with their debate counts
    const users = await usersCollection.aggregate([
      {
        $lookup: {
          from: 'debate_sessions',
          localField: '_id',
          foreignField: 'userId',
          pipeline: [
            { $project: { _id: 1 } }
          ],
          as: 'debates'
        }
      },
      {
        $project: {
          password: 0
        }
      },
      {
        $addFields: {
          debateCount: { $size: '$debates' }
        }
      },
      {
        $project: {
          debates: 0
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
