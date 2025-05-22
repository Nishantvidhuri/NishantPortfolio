import React, { useState, useEffect } from 'react';
import { FaFilePdf, FaDownload, FaExpand, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';

function ResumeSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const resumeUrl = "https://drive.google.com/file/d/12X6s-MHb241ZFPOcQPdi59Akb_5QqJ9-/view?usp=sharing";

  const getEmbedUrl = (url) => {
    const fileId = url.split('/')[5];
    return `https://drive.google.com/file/d/${fileId}/preview`;
  };

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isExpanded]);

  return (
    <div className="px-4 md:px-12 py-8">
      <h2 className="text-2xl text-white mb-6">My Resume</h2>
      
      {/* Regular View */}
      <div className="bg-[#1a1a1a] rounded-lg overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-[#141414] p-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <FaFilePdf className="text-red-500 text-2xl" />
            <span className="text-white text-lg font-medium">Resume</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#333] hover:bg-[#444] text-white rounded-md transition-colors"
            >
              <FaExpand size={16} />
              <span className="hidden xs:inline">Expand</span>
            </button>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#333] hover:bg-[#444] text-white rounded-md transition-colors"
            >
              <FaExternalLinkAlt size={16} className='text-white'/>
              <span className="hidden xs:inline">View</span>
            </a>
            <a
              href={resumeUrl}
              download
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              <FaDownload size={16} className='text-white' />
              <span className="hidden xs:inline">Download</span>
            </a>
          </div>
        </div>

        {/* Preview */}
        <div className="h-[40vh] bg-[#222]">
          <iframe
            src={getEmbedUrl(resumeUrl)}
            title="Resume Preview"
            className="w-full h-full"
            style={{ pointerEvents: 'none' }}
          />
        </div>
      </div>

 {/* Expanded View Modal */}
{isExpanded && (
  <div className="fixed inset-0 mt-10 h-screen bg-black/90 z-50 flex flex-col">
    {/* Modal Header */}
    <div className="bg-[#141414] px-4 py-3 flex items-center justify-between border-b border-gray-800 relative">
      <div className="flex items-center gap-3">
        <FaFilePdf className="text-red-500 text-xl" />
        <span className="text-white font-medium">Resume Preview</span>
      </div>
    </div>

    {/* Close Button - Placed on Top */}
    <button
              onClick={() => setIsExpanded(false)}
              className="flex justify-end gap-2 px-4 py-3  text-white rounded-md transition-colors"
            >
              <FaTimes size={24} />
              <span className="hidden xs:inline">Shrink</span>
            </button>

    {/* Modal Content */}
    <div className="flex-1 w-[90%] mx-auto overflow-hidden relative">
      <iframe
        src={getEmbedUrl(resumeUrl)}
        title="Resume Preview"
        className="w-full h-full"
      />
    </div>
  </div>
)}

    </div>
  );
}

export default ResumeSection;