const User = require("../models/User"); 


exports.getDistributorProfile = async (req, res) => {
  try {
    const { userID } = req.query;
    if (!userID) return res.status(400).json({ message: "❌ User ID is required!" });

    const distributor = await User.findOne({ userID, role: "Distributor" }).select("name userID profilePic");
    if (!distributor) return res.status(404).json({ message: "❌ Distributor not found!" });

    res.json(distributor);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching profile", error: err.message });
  }
};
