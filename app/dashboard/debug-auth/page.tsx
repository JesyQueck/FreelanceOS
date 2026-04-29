import { createClient } from "@/utils/supabase/server";

export default async function DebugAuthPage() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  return (
    <div className="p-10 font-mono text-xs space-y-4 bg-black text-green-400 min-h-screen">
      <h1 className="text-xl font-bold border-b border-green-900 pb-2">Auth Debugger</h1>
      
      <div>
        <h2 className="font-bold text-white mb-1 uppercase text-[10px]">User Object:</h2>
        <pre className="bg-slate-900 p-4 rounded overflow-auto max-h-60 border border-slate-800">
          {JSON.stringify(user, null, 2) || "NULL"}
        </pre>
        {userError && <p className="text-red-500 mt-2">Error: {userError.message}</p>}
      </div>

      <div>
        <h2 className="font-bold text-white mb-1 uppercase text-[10px]">Session Status:</h2>
        <div className="bg-slate-900 p-4 rounded border border-slate-800">
          <p>Logged In: {user ? "YES" : "NO"}</p>
          <p>Session Active: {session ? "YES" : "NO"}</p>
          <p>Access Token Present: {session?.access_token ? "YES" : "NO"}</p>
          <p>Expires In: {session?.expires_in} seconds</p>
        </div>
        {sessionError && <p className="text-red-500 mt-2">Error: {sessionError.message}</p>}
      </div>
      
      <div className="text-slate-500 text-[10px]">
        If User is YES but Session is NO, or vice versa, your browser is blocking the cookie handshake.
      </div>
    </div>
  );
}
