'use client';

import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/me', {
        });
        const data = await res.json();

        if (res.ok) {
          setProfile(data.user);
        } else {
          setError(data.message || 'Failed to fetch profile.');
        }
      } catch (err) {
        setError('Error fetching profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>

      <p><strong>Name:</strong> {profile?.name}</p>
      {profile?.email && <p><strong>Email:</strong> {profile.email}</p>}
      {profile?.phone && <p><strong>Phone:</strong> {profile.phone}</p>}
    </div>
  );
}
