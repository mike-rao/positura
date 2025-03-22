import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Study() {
  const router = useRouter();
  const videoRef = useRef(null);

  useEffect(() => {
    async function getCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }
    getCamera();

    // Send frames to backend periodically (example)
    const interval = setInterval(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      const response = await axios.post('http://localhost:8000/upload-video', {
        image: dataUrl,
      });
      console.log(response.data.posture);
    }, 1000); // Every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Study Session</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md flex-1">
          <h2 className="text-lg font-semibold">Live Feed</h2>
          <video ref={videoRef} autoPlay className="w-full h-64" />
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