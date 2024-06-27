export default function Footer() {
  return (
    <footer className="mt-10  text-center text-slate-700 ">
      <small className="mb-2 block text-xs">
        &copy; 2024{' '}
        <a
          href="https://yingshen.info"
          className="font-semibold hover:underline hover:text-blue-600 cursor-pointer"
          target="_blank">
          Ying.Dev
        </a>
        . All rights reserved.
      </small>
      <p className="text-xs">
        <span className="font-semibold">About this website:</span> built with
        React, Tailwind CSS, shadcn/ui, FastAPI, AWS S3 & DynamoDB, Langchain,
        OpenAI, Qdrant.
      </p>
      <p className="text-xs">Deploy with Vercel, Modal, and AWS.</p>
    </footer>
  )
}
