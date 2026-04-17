import React from "react";

const AboutUs = () => {
  return (
    <div className=" w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className=" text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          About <span className="text-sky-900">Datahaven</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Datahaven is more than just a library. We are a haven for our
          community that provides knowledge and resources.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8  ">
        {/* Welcome Card */}
        <div className=" bg-white border border-slate-200 p-8 rounded-3xl hover:border-slate-400 transition-all duration-500 flex flex-col shadow-md shadow-black/5">
          <div className="flex justify-left gap-4 text-center items-center flex-wrap">
            <div className="w-14 h-14 rounded-2xl bg-slate-400/10 border border-slate-400/20 flex items-center justify-center mb-2 -hover:scale-110 -hover:bg-slate-400/20 transition-all duration-500">
              {/* User/Welcome Icon */}
              <svg
                className="w-7 h-7 text-slate-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-wide -hover:text-slate-400 transition-colors">
              Welcome
            </h2>
          </div>
          <p className="text-slate-600 leading-relaxed flex-1">
            Whether you are here to conduct research, borrow equipment, or
            simply dive into a good book, Datahaven is your space.
          </p>
        </div>
        {/* Mission Card */}
        <div className=" bg-white border border-slate-200 p-8 rounded-3xl hover:border-slate-400 transition-all duration-500 flex flex-col shadow-md shadow-black/5">
          <div className="flex justify-left gap-4 text-center items-center flex-wrap">
            <div className="w-14 h-14 rounded-2xl bg-slate-400/10 border border-slate-400/20 flex items-center justify-center mb-2 -hover:scale-110 -hover:bg-slate-400/20 transition-all duration-500">
              {/* Target/Mission Icon */}
              <svg
                className="w-7 h-7 text-slate-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-wide -hover:text-slate-400 transition-colors">
              Our Mission
            </h2>
          </div>
          <p className="text-slate-600 leading-relaxed flex-1">
            Our mission is to empower our community by providing access to
            knowledge, technology, and various resources. We strive to be a
            sanctuary for learning and collaboration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
