import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();

// Triggers whenever a user casts or updates a vote in the "votes" collection
export const onVoteCreated = onDocumentWritten(
  {
    document: "votes/{userId}",
    region: "asia-southeast1",
  },
  async (event) => {
    const votesRef = admin.firestore().collection("votes");
    const snapshot = await votesRef.get();

    let lovers = 0;
    let haters = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.vote === "lovers") lovers++;
      if (data.vote === "haters") haters++;
    });

    // Update aggregate vote tallies in a central metadata document
    return admin.firestore().collection("totals").doc("summary").set(
      {
        pineappleLovers: lovers,
        pineappleHaters: haters,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }
);