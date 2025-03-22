import { useRouter } from 'next/router';

export default function History() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Session History</h1>
      <ul className="bg-white p-4 rounded-lg shadow-md">
        <li
          onClick={() => router.push('/summary')}
          className="cursor-pointer hover:bg-gray-100 p-2"
        >
          Session 1 - March 22, 2025
        </li>
      </ul>
      <button
        onClick={() => router.push('/')}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Back to Home
      </button>
    </div>
  );
}