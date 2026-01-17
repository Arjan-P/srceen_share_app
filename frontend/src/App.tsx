import { Outlet } from "react-router-dom";

function App() {
  navigator.mediaDevices.enumerateDevices().then(devices => console.log(devices));
  return (
    <>
      <div className="h-[100dvh] flex flex-col items-center bg-gray-800 overflow-y-auto">
        <main className="h-full w-full p-4 overflow-y-auto">
          <div className='w-full h-full px-4 rounded-xl shadow-xl bg-gray-600 overflow-y-auto'>
            <Outlet />
          </div>
        </main>
      </div>
    </>
  )
}

export default App
