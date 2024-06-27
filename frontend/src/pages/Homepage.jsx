// import { useAuth } from '../context/useAuth'
import { FcFlashOn, FcGoogle } from 'react-icons/fc'
import useAuthActions from '@/hooks/useAuthActions'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

function Homepage() {
  const { handleLogin } = useAuthActions()

  return (
    <div className="w-full h-full grainy-light flex flex-col items-center">
      <Navbar />
      <div className="w-full max-w-screen-xl min-h-[calc(100vh-56px)] flex flex-col items-center  gap-6 py-10 px-6">
        <p className=" pt-3 md:pt-10 w-full max-w-screen-md text-center  text-3xl md:text-4xl xl:text-5xl font-bold md:leading-[60px] xl:leading-[70px]">
          DocsChat.AI - The best app to chat with documents and websites.
        </p>

        <h2 className="w-full text-center text-2xl ">
          Chat with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 text-slate-100 p-1 font-bold">
            documents
          </span>{' '}
          or{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 text-slate-100 p-1 font-bold">
            websites
          </span>{' '}
          in seconds.
        </h2>
        <p className="text-slate-600/70 text-base lg:text-lg hidden md:flex">
          Simply upload your PDF file or website link and start asking questions
          right away!
        </p>

        <button
          className=" ring-1 ring-slate-300 bg-white/50 hover:bg-slate-100/70 text-base font-semibold lg:text-lg  px-10 py-3 rounded-lg flex mb-20 items-center gap-3 "
          onClick={handleLogin}>
          <p>Try Free with Google </p>
          <FcGoogle className="size-6" />
        </button>

        <div className="w-full max-w-screen-lg flex flex-col md:flex-row  ">
          <div className="text-center md:text-start flex-grow flex flex-col gap-3 lg:gap-5 p-3">
            <h1 className="text-2xl font-semibold">
              <FcFlashOn className=" w-8 h-8 inline-block" />
              Efficiency Boost!
            </h1>
            <ul className="text-lg font-semibold">
              Straight to knowledge via Q&As!
            </ul>
            <li className="">
              Ask your file / webpage, get the info you need.
            </li>
            <li>Select PDF / websites, receive AI analysis.</li>
            <li>Start a chat, uncover deeper knowledge.</li>
          </div>
          <div className="w-full md:w-2/3 h-fit bg-slate-600/30 rounded-[24px] p-6 ">
            <div className="w-full relative " style={{ paddingTop: '67.6%' }}>
              <video
                className="absolute top-0 left-0 w-full h-full"
                loop
                muted
                autoPlay
                playsInline>
                <source src="/demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default Homepage
