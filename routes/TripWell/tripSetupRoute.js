// routes/TripWell/tripSetupRoutes.js
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const { tripName, purpose, startDate, endDate, city, partyCount, whoWith = [] } = req.body || {};
    if (!tripName || !purpose || !city || !startDate || !endDate) {
      return res.status(400).json({ ok:false, error:"Missing required fields" });
    }

    const sd = new Date(startDate), ed = new Date(endDate);
    if (Number.isNaN(sd.getTime()) || Number.isNaN(ed.getTime())) {
      return res.status(400).json({ ok:false, error:"Invalid start/end date" });
    }

    const payload = {
      tripName: String(tripName).trim(),
      purpose:  String(purpose).trim(),
      city:     String(city).trim(),
      startDate: sd,
      endDate:   ed,
      whoWith: Array.isArray(whoWith) ? whoWith : [],
    };
    if (partyCount !== undefined && partyCount !== "") {
      const pc = Number(partyCount);
      if (Number.isFinite(pc) && pc >= 1) payload.partyCount = pc;
    }

    const doc = await TripBase.create(payload);
    console.log("✅ Trip saved", doc._id.toString()); // keep for tracing

    // Don’t return tripId. Just signal success.
    return res.status(201).json({ ok: true });
    // (or: res.sendStatus(201); if you prefer *no* body — but then don’t call resp.json() on FE)
  } catch (err) {
    console.error("❌ trip-setup error:", err);
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors || {}).map(e => e.message).join(", ");
      return res.status(400).json({ ok:false, error: msg || "Validation error" });
    }
    return res.status(500).json({ ok:false, error: err.message || "Server error" });
  }
});