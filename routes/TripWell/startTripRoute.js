router.patch("/starttrip/:tripId", async (req, res) => {
  const { tripId } = req.params;
  const firebaseId = req.user?.uid;

  const user = await User.findOne({ firebaseId });
  const trip = await TripBase.findById(tripId);

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
