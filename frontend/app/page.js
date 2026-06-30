"use client";

import { useEffect, useState} from 'react';

export default function Home(){

  const [serverStatus, setServerStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
        const data = await response.json();
        setServerStatus(data);

      } catch(error) {
        setServerStatus ({ status: 'error', message: 'Cannot reach server'});
      } finally {
        setLoading(false);

      }
    };
    checkServer();
}, []);

return (
  <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
    <div className="text-center space-y-4">
      <h1 className="text-3xl font-bold"> Social Commerce Dashboard </h1>
      <p className="text-gray-400">Backend Status</p>
      {loading ? (
        <p className="text-gray-500">Checking...</p>
      ) : ( 
        <div className={`px-4 py-2 rounded-full text-sm font-medium inline-block ${
        serverStatus?.status === 'ok'
          ? 'bg-green-900 text-green-300'
          : 'bg-red-900 text-red-300'}`}>
          {serverStatus?.status === 'ok' ? '● Server Connected' : '● Server Unreachable'}
        </div>
      )}
    </div>
  </main>
);
}