import HomeContent from "./components/screen/HomeContent";
import { FaDiamond } from "react-icons/fa6";
import connectToDatabase from '../lib/mongodb';
import SystemSettings from '../lib/models/SystemSettings';
import TopRightControls from './components/TopRightControls';

interface HomeConfig {
  title: string;
  bulletPoints: string[];
  imageUrl: string;
}

async function getHomeConfig(): Promise<HomeConfig> {
  try {
    await connectToDatabase();
    const setting = await SystemSettings.findOne({ key: 'home_config' });
    
    if (setting?.value) {
      return setting.value;
    }
  } catch (error) {
    console.error('Error fetching home config:', error);
  }
  
  // Return default configuration if setting doesn't exist or error occurs
  return {
    title: 'Your SDV journey starts here.',
    bulletPoints: [
      'From zero to hero',
      'Practice in our virtual lab and seamlessly transition to physical kit',
      'Track your progress and get certificates',
      'Stay in the loop with our community'
    ],
    imageUrl: '/imgs/sdv.png'
  };
}

// Revalidate every 5 minutes (300 seconds)
export const revalidate = 300;

export default async function Home() {
  const homeConfig = await getHomeConfig();

  return (
    <div className="bg-white text-slate-600 text-2xl p-0
        h-full w-full flex flex-col gap-0 relative">

      {/* Top right controls - Admin link and UserBadge */}
      <TopRightControls />

      <div className="w-full bg-gradient-to-br from-primary-800 via-primary-800 to-primary-700 text-white flex flex-col items-center justify-center pt-8 pb-8 px-6 lg:px-12">
        <div className="container h-full flex sm:flex-row flex-col gap-6">
          <div className="flex-3 px-2">
            <div className="text-2xl sm:text-2xl lg:text-4xl font-bold  pt-8 text-left">
              {homeConfig.title}
            </div>
            <div className="text-sm sm:text-md leading-tight font-bold text-left pt-4 mt-4 flex flex-col gap-2">
              {homeConfig.bulletPoints.map((point, index) => (
                <div key={index} className="flex items-center">
                  <FaDiamond size={12} className="mr-4 text-white min-w-3" /> 
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-2 px-2 grid place-items-center">
            <img 
              className="w-[40vw] h-[200px] sm:w-[40vw] object-contain" 
              src={homeConfig.imageUrl} 
              alt="Hero image"
            />
          </div>

        </div>

        <div className="container h-full flex flex-col gap-2 mt-8">
          <div className="w-full text-center">How do you want to start?</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-2 text-xs sm:text-sm lg:text-base xl:text-base text-center leading-tight">
            <a href="#pathList" className="flex">
              <div className="flex-1 rounded-lg bg-white flex flex-col items-center justify-center px-2 py-2 cursor-pointer hover:scale-105">
                <img className="h-28 p-4" src="/imgs/learning_path_icon.png" />
                <div className="font-bold px-4 py-1 text-neutral-500">I want to follow a guided path</div>
              </div>
            </a>

            <a href="/manage" className="flex">
              <div className="flex-1 rounded-lg bg-white flex flex-col items-center justify-center px-2 py-2 cursor-pointer hover:scale-105">
                <img className="h-28" src="/imgs/edit_path_icon.jpg" />
                <div className="font-bold px-4 py-1 text-neutral-500">I want to design a new path</div>
              </div>
            </a>

            <div className="flex-1 rounded-lg bg-white flex flex-col items-center justify-center px-2 py-2 cursor-pointer hover:scale-105">
              <img className="h-28" src="/imgs/hackathon.png" />
              <div className="font-bold px-4 py-1 text-neutral-500">I want to plan a hackathon</div>
            </div>

            <a href="#dreamkit" className="flex">
              <div className="flex-1 rounded-lg bg-white flex flex-col items-center justify-center px-2 py-2 cursor-pointer hover:scale-105">
                <img className="h-28" src="/imgs/dreamKit.png" />
                <div className="font-bold px-4 py-1 text-neutral-500">I want to work with dreamKIT</div>
              </div>
            </a>
          </div>
        </div>

      </div>

      <div>
        {/* <PathList/> */}
        <HomeContent />
      </div>

    </div>
  );
}
