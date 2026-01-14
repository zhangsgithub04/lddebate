import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import { DebateSession } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const debateData = await request.json();

    const db = await getDatabase();
    const sessionsCollection = db.collection<DebateSession>('debate_sessions');

    const session: DebateSession = {
      userId: user.userId,
      topic: debateData.topic,
      humanSide: debateData.humanSide,
      aiSide: debateData.aiSide,
      humanValue: debateData.humanValue,
      aiValue: debateData.aiValue,
      frameworkStrategy: debateData.frameworkStrategy,
      arguments: debateData.arguments.map((arg: { id: string; speaker: string; phase: string; content: string; timestamp: string | Date; timeUsed?: number }) => ({
        ...arg,
        timestamp: new Date(arg.timestamp).toISOString(),
      })),
      judgeFeedback: debateData.judgeFeedback,
      createdAt: new Date(),
      completedAt: debateData.judgeFeedback ? new Date() : undefined,
    };

    const result = await sessionsCollection.insertOne(session);

    return NextResponse.json({
      message: 'Debate session saved successfully',
      sessionId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Save session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const sessionsCollection = db.collection<DebateSession>('debate_sessions');

    const sessions = await sessionsCollection
      .find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
