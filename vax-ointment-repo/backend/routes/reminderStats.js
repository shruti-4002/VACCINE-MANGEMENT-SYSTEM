router.get("/stats", async (req, res) => {
  const total = await Appointment.countDocuments();
  res.json({ totalEmailsScheduled: total });
});
