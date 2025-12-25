import React from "react";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";
import "./styles.css";

export default function App() {
  return (
    <div className="h-screen w-screen bg-blue-100 p-4 font-sans">
      <div className="h-full overflow-hidden flex flex-row  ">
        <div className="h-full flex-1 overflow-hidden flex flex-row bg-white border-t border-r border-gray-200 rounded-tr-xl mr-2">
          <Sidebar /> <MidArea />
        </div>
        <div className="h-full w-1/3 overflow-hidden flex flex-row bg-white border-t border-l border-gray-200 rounded-tl-xl ml-2">
          <PreviewArea />
        </div>
      </div>
    </div>
  );
}
