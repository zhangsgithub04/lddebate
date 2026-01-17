'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Shield, ShieldOff } from 'lucide-react';

interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin?: boolean;
  createdAt: string;
  debateCount: number;
}

interface AdminSession {
  _id: string;
  userId: string;
  topic: string;
  humanSide: 'affirmative' | 'negative';
  createdAt: string;
  completedAt?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  judgeFeedback?: {
    winner: 'human' | 'ai' | 'tie';
    humanScore: number;
    aiScore: number;
  };
}

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [view, setView] = useState<'users' | 'sessions'>('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingAdmin, setTogglingAdmin] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [usersRes, sessionsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/sessions')
      ]);

      if (!usersRes.ok || !sessionsRes.ok) {
        if (usersRes.status === 403 || sessionsRes.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError('Failed to load admin data');
        }
        return;
      }

      const usersData = await usersRes.json();
      const sessionsData = await sessionsRes.json();

      setUsers(usersData.users || []);
      setSessions(sessionsData.sessions || []);
    } catch (err) {
      setError('Error loading admin data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    setTogglingAdmin(userId);
    
    try {
      const res = await fetch('/api/admin/toggle-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isAdmin: !currentStatus })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update admin status');
      }

      // Refresh users list
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update admin status');
    } finally {
      setTogglingAdmin(null);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">{error}</div>
            <div className="text-center mt-4">
              <Button onClick={onBack}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users and view debate sessions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            Refresh
          </Button>
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={view === 'users' ? 'default' : 'outline'}
          onClick={() => setView('users')}
        >
          Users ({users.length})
        </Button>
        <Button
          variant={view === 'sessions' ? 'default' : 'outline'}
          onClick={() => setView('sessions')}
        >
          Sessions ({sessions.length})
        </Button>
      </div>

      {view === 'users' ? (
        <Card>
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
            <CardDescription>All users registered on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {users.map((user) => (
                  <Card key={user._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">
                              {user.firstName} {user.lastName}
                            </h3>
                            {user.isAdmin && (
                              <Badge variant="default">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <p className="text-xs text-muted-foreground">
                              Joined: {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.debateCount} debate{user.debateCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={user.isAdmin ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => toggleAdminStatus(user._id, !!user.isAdmin)}
                          disabled={togglingAdmin === user._id}
                        >
                          {togglingAdmin === user._id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : user.isAdmin ? (
                            <>
                              <ShieldOff className="w-4 h-4 mr-2" />
                              Remove Admin
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4 mr-2" />
                              Make Admin
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Debate Sessions</CardTitle>
            <CardDescription>All completed debate sessions (most recent 100)</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {sessions.map((session) => (
                  <Card key={session._id}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold line-clamp-2">{session.topic}</h3>
                            {session.user && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {session.user.firstName} {session.user.lastName} ({session.user.email})
                              </p>
                            )}
                          </div>
                          <Badge variant={session.humanSide === 'affirmative' ? 'default' : 'secondary'}>
                            {session.humanSide}
                          </Badge>
                        </div>
                        
                        {session.judgeFeedback && (
                          <div className="flex gap-4 text-sm pt-2 border-t">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Winner:</span>
                              <Badge variant={
                                session.judgeFeedback.winner === 'human' ? 'default' :
                                session.judgeFeedback.winner === 'ai' ? 'destructive' :
                                'secondary'
                              }>
                                {session.judgeFeedback.winner === 'human' ? 'Human' : 
                                 session.judgeFeedback.winner === 'ai' ? 'AI' : 'Tie'}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Human: </span>
                              <span className="font-medium">{session.judgeFeedback.humanScore}/100</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">AI: </span>
                              <span className="font-medium">{session.judgeFeedback.aiScore}/100</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground">
                          Started: {new Date(session.createdAt).toLocaleString()}
                          {session.completedAt && (
                            <> • Completed: {new Date(session.completedAt).toLocaleString()}</>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {sessions.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No debate sessions found
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
