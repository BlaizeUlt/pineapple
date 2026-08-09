import { auth, googleProvider, db } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData, useCollection } from "react-firebase-hooks/firestore";
import { doc, setDoc, deleteDoc, collection, serverTimestamp } from "firebase/firestore";

export default function Home() {
  const [user, loading] = useAuthState(auth);

  // Aggregate totals managed by Cloud Function
  const totalsRef = doc(db, "totals", "summary");
  const [totalsData] = useDocumentData(totalsRef);

  // Current user's vote status
  const userVoteRef = user ? doc(db, "votes", user.uid) : null;
  const [userVoteData] = useDocumentData(userVoteRef);

  // Real-time list of all vote documents for the Voters list
  const [votesSnapshot] = useCollection(collection(db, "votes"));

  const handleVote = async (choice: "lovers" | "haters") => {
    if (!user || !userVoteRef) return;

    try {
      // Toggle off: If clicking the active choice, delete the vote document
      if (userVoteData?.vote === choice) {
        await deleteDoc(userVoteRef);
        return;
      }

      // Save or update vote document with profile info
      await setDoc(userVoteRef, {
        vote: choice,
        displayName: user.displayName || "Anonymous User",
        photoURL: user.photoURL || "",
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving vote:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-200 via-purple-300 to-indigo-300 text-black flex flex-col items-center justify-start pt-12 pb-16 px-4">
      {/* Header */}
      <h1 className="text-5xl font-extrabold mb-10 tracking-tight text-center">
        Pineapple on Pizza?
      </h1>

      {loading ? (
        <p className="text-xl font-medium">Loading...</p>
      ) : !user ? (
        <button
          onClick={() => signInWithPopup(auth, googleProvider)}
          className="bg-white hover:bg-slate-100 text-black font-bold border-2 border-black px-6 py-3 rounded-lg shadow-md transition"
        >
          Sign in with Google to Vote
        </button>
      ) : (
        <div className="flex flex-col items-center w-full max-w-xl">
          {/* User Status Bar */}
          <div className="flex items-center gap-3 mb-8 bg-white/40 px-4 py-2 rounded-full border border-black/10">
            <span className="text-sm font-semibold">Signed in as {user.displayName}</span>
            <button
              onClick={() => signOut(auth)}
              className="text-xs bg-black text-white hover:bg-slate-800 px-3 py-1 rounded-full font-medium transition"
            >
              Sign out
            </button>
          </div>

          {/* Voting Buttons & Real-Time Counters */}
          <div className="flex flex-col gap-6 w-full max-w-md">
            {/* Pineapple Lovers Row */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => handleVote("lovers")}
                className={`bg-white border-2 border-black p-3 rounded-md shadow-md flex items-center justify-center min-w-[170px] hover:scale-105 transition transform ${
                  userVoteData?.vote === "lovers" ? "ring-4 ring-emerald-500" : ""
                }`}
              >
                <span className="text-3xl">✅ 🍍 🍕</span>
              </button>
              <span className="text-2xl font-bold">
                Pineapple Lovers: {totalsData?.pineappleLovers || 0}
              </span>
            </div>

            {/* Pineapple Haters Row */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => handleVote("haters")}
                className={`bg-white border-2 border-black p-3 rounded-md shadow-md flex items-center justify-center min-w-[170px] hover:scale-105 transition transform ${
                  userVoteData?.vote === "haters" ? "ring-4 ring-rose-500" : ""
                }`}
              >
                <span className="text-3xl">❌ 🍍 🍕</span>
              </button>
              <span className="text-2xl font-bold">
                Pineapple Haters: {totalsData?.pineappleHaters || 0}
              </span>
            </div>
          </div>

          {/* Remove Vote Link */}
          {userVoteData && (
            <button
              onClick={() => userVoteRef && deleteDoc(userVoteRef)}
              className="mt-6 text-sm font-semibold text-slate-700 hover:text-rose-700 underline transition"
            >
              Remove my vote
            </button>
          )}

          {/* Real-time Voter Feed */}
          <div className="mt-16 w-full flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6 text-center">Voters:</h2>
            <div className="flex flex-col gap-4 w-full max-w-md">
              {votesSnapshot?.docs
                .filter((doc) => doc.data().displayName)
                .map((doc) => {
                  const data = doc.data();
                  return (
                    <div key={doc.id} className="flex items-center gap-4">
                      {data.photoURL ? (
                        <img
                          src={data.photoURL}
                          alt={data.displayName}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-full border-2 border-black object-cover shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full border-2 border-black bg-slate-300 flex items-center justify-center font-bold text-xl">
                          {data.displayName?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-2xl font-bold">{data.displayName}</p>
                        <p className="text-xl font-semibold flex items-center gap-1">
                          Voted: {data.vote === "lovers" ? "✅ 🍍" : "❌ 🍍"}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}