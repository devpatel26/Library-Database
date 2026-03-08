import React from "react";

function clickFunction() {
  alert("Test");
}

export default function PrimaryButton({ title }) {
  return (
    <div className="inline">
      <button
        onClick={clickFunction}
        className="rounded-md bg-indigo-800 px-3 py-1.5 outline-1 -outline-offset-1 outline-indigo-700 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 m-1 hover:bg-indigo-500 disabled:bg-indigo-1000"
      >
        {title}
      </button>
    </div>
  );
}

export function SubmitButton({ title, value }) {
  return (
    <div className="inline">
      <button
        type="submit"
        onClick={clickFunction}
        className="rounded-md bg-indigo-800 px-3 py-1.5 outline-1 -outline-offset-1 outline-indigo-700 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 m-1 hover:bg-indigo-500 disabled:bg-indigo-1000"
      >
        {title}
      </button>
    </div>
  );
}

export function SecondaryButton({ title }) {
  return (
    <div className="inline">
      <button
        onClick={clickFunction}
        className="rounded-md  px-3 py-1.5 outline-1 -outline-offset-1 outline-indigo-700 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-900 sm:text-sm/6 m-1 hover:bg-indigo-900 disabled:bg-indigo-1000"
      >
        {title}
      </button>
    </div>
  );
}
