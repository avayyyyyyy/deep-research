import ChatLayout from "@/components/ChatLayout";
import Footer from "@/components/Unified/Footer";
import Header from "@/components/Unified/Header";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen max-w-5xl mx-auto">
      <Header />
      <ChatLayout />  
      <Footer />
    </div>
  );
}
