router.patch("/starttrip/:tripId", async (req, res) => {
  const { tripId } = req.params;
  const firebaseId = req.user.uid;

  const user = await User.findOne({ firebaseId });
  if (!user) return res.status(404).json({ error: "User not found" });

  const trip = await TripBase.findById(tripId);
  if (!trip) return res.status(404).json({ error: "Trip not found" });

  if (user.role === "originator") {
    trip.tripStartedByOriginator = true;
  } else if (user.role === "participant") {
    trip.tripStartedByParticipant = true;
  }

  await trip.save();

  res.status(200).json({
    message: "Trip start recorded",
    tripStartedByOriginator: trip.tripStartedByOriginator,
    tripStartedByParticipant: trip.tripStartedByParticipant
  });
});
