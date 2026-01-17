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

    const sessionsCollection = db.collection('debate_sessions');
    
    // Get all sessions with user info
    const sessions = await sessionsCollection.aggregate([
      {
        $addFields: {
          userObjectId: { 
            $cond: {
              if: { $eq: [{ $type: '$userId' }, 'string'] },
              then: { $toObjectId: '$userId' },
              else: '$userId'
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userObjectId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          'user.password': 0,
          'arguments.content': 0
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 100
      }
    ]).toArray();

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
