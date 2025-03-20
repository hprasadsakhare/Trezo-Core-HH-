"use client";

export default function Footer() {
  const date = new Date();

  return (
    <footer className="bg-black text-white py-6">
      <div className="w-full mx-auto max-w-screen-xl flex flex-col md:flex-row items-center justify-between px-6">
        <span className="text-sm text-gray-400">
          © {date.getFullYear()}{" "}
          <a href="/" className="hover:underline text-white">
            Trezo
          </a>
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}
