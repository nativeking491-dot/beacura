import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const CheckAdmin: React.FC = () => {
    const [info, setInfo] = useState<any>(null);

    useEffect(() => {
        const check = async () => {
            // Get current session
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                // Get profile
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                setInfo({
                    email: session.user.email,
                    userId: session.user.id,
                    profileRole: profile?.role,
                    profileName: profile?.name,
                    isAdmin: profile?.role === 'ADMIN'
                });
            } else {
                setInfo({ error: 'Not logged in' });
            }
        };
        check();
    }, []);

    if (!info) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 bg-white rounded-lg shadow-lg max-w-2xl mx-auto mt-8">
            <h2 className="text-2xl font-bold mb-4">🔍 Admin Check</h2>

            <div className="space-y-3">
                <div className="flex justify-between p-3 bg-slate-50 rounded">
                    <span className="font-semibold">Logged in as:</span>
                    <span className="font-mono">{info.email || 'Not logged in'}</span>
                </div>

                <div className="flex justify-between p-3 bg-slate-50 rounded">
                    <span className="font-semibold">User ID:</span>
                    <span className="font-mono text-xs">{info.userId}</span>
                </div>

                <div className="flex justify-between p-3 bg-slate-50 rounded">
                    <span className="font-semibold">Name:</span>
                    <span>{info.profileName || 'N/A'}</span>
                </div>

                <div className="flex justify-between p-3 bg-slate-50 rounded">
                    <span className="font-semibold">Role in Database:</span>
                    <span className={`font-bold ${info.profileRole === 'ADMIN' ? 'text-rose-600' : 'text-teal-600'}`}>
                        {info.profileRole || 'NOT FOUND'}
                    </span>
                </div>

                <div className={`p-4 rounded-lg ${info.isAdmin ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
                    <p className="font-bold text-lg">
                        {info.isAdmin ? '✅ IS ADMIN' : '❌ NOT ADMIN'}
                    </p>
                </div>
            </div>

            {!info.isAdmin && (
                <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500">
                    <h3 className="font-bold mb-2">To fix this:</h3>
                    <ol className="list-decimal ml-5 space-y-2">
                        <li>Go to Supabase SQL Editor</li>
                        <li>Run: <code className="bg-slate-200 px-2 py-1 rounded">UPDATE users SET role = 'ADMIN' WHERE email = '{info.email}';</code></li>
                        <li>Logout and login again</li>
                    </ol>
                </div>
            )}
        </div>
    );
};

export default CheckAdmin;
