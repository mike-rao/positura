import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Posture Tracker</h1>
      <button
        onClick={() => router.push('/study')}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 mb-4"
      >
        Start Study Session
      </button>
      <button
        onClick={() => router.push('/history')}
        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
      >
        View History
      </button>
    </div>
  );
}