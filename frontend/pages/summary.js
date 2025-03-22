import { useRouter } from 'next/router';

export default function Summary() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Session Summary</h1>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <p>Total Time: 45:32</p>
        <p>Pie Chart Placeholder (Good: 50%, Hunched: 30%, Slouched: 15%, Leg Up: 5%)</p>
      </div>
      <button
        onClick={() => router.push('/')}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Back to Home
      </button>
    </div>
  );
}