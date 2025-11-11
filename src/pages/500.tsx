import { NextPage } from 'next';

const ServerErrorPage: NextPage = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold">500 - Server Error</h1>
        <p>Something went wrong. Please try again later.</p>
      </div>
    </main>
  );
};

export default ServerErrorPage;