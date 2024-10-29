import { Chatbot } from "@/components/Chatbot";
import Header from '@/components/Header';

export default function Home() {
  return (
    <div className='bg-gray-100 min-h-screen p-8'>
      <Header /> 
      <main className="flex-grow flex items-center justify-center">
        <Chatbot /> 
      </main>
    </div>
  );
}
