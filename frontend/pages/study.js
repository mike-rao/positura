import { useRouter } from 'next/router';

export default function Study() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Study Session</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md flex-1">
          <h2 className="text-lg font-semibold">Live Feed</h2>
          <div className="h-64 bg-gray-300 flex items-center justify-center">
            {/* Placeholder for live feed */}
            <p>Live Feed Placeholder</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <p>Timer: 00:00</p>
          <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
            Pause
          </button>
          <button
            onClick={() => router.push('/summary')}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}