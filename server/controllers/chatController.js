const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require("../config/db");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

const chatQuery = async (req, res) => {
  const { message } = req.body;

  try {
    // 🔥 Step 1: Convert user query → SQL
    const prompt = `
      Convert this question into SQL:

      "${message}"

      Rules:
      - Only SELECT queries
      - DO NOT assume team1_id = participant_id
      - Return IDs only (team1_id, team2_id)
      - Use joins only for event and sport

      Tables:
      matches(id, event_id, sport_id, team1_id, team2_id, winner_id, round, status)
      events(id, name)
      sports(id, name)

      Return:
      event_name, sport_name, round, team1_id, team2_id, status
      `;


    const result = await model.generateContent(prompt);
    let sql = result.response.text()
    .replace(/```sql|```/g, "")
    .trim();

    // 🔥 FIX: normalize status
    sql = sql.replace(/status\s*=\s*'Pending'/gi, "status = 'pending'");

    // 🔥 Make status comparison case-insensitive
    // 🔥 Handle BOTH formats of status condition
    sql = sql.replace(
      /(LOWER\(m\.status\)\s*=\s*LOWER\('pending'\)|m\.status\s*=\s*'pending')/gi,
      "LOWER(m.status) != LOWER('completed')"
    );

    sql = sql.replace(
    /e\.name\s*=\s*'([^']+)'/gi,
    "LOWER(e.name) = LOWER('$1')"
    );

    // 🔥 FIX: Convert exact event match → fuzzy match
    sql = sql.replace(
      /LOWER\(e\.name\)\s*=\s*LOWER\('([^']+)'\)/gi,
      "LOWER(e.name) LIKE LOWER('%$1%')"
    );

    console.log("Generated SQL:", sql);

    if (!sql.toLowerCase().includes("join")) {
        return res.json({
            reply: "Query not supported. Please be more specific."
        });
    }

    // 🔥 Step 2: Execute SQL
    db.query(sql, (err, data) => {
      if (err) {
        console.error(err);
        return res.json({ reply: "Error in query" });
      }

      if (data.length === 0) {
        return res.json({ reply: "No data found" });
      }

      // 🔥 Step 3: Convert result → human response
      const formatMatches = async (rows) => {
        const formatted = [];

        for (let m of rows) {

          let player1 = m.team1_id;
          let player2 = m.team2_id;

          // 🔥 Try to get participant name
          const [p1] = await db.promise().query(
            "SELECT name FROM participants WHERE id=?",
            [m.team1_id]
          );

          const [p2] = await db.promise().query(
            "SELECT name FROM participants WHERE id=?",
            [m.team2_id]
          );

          if (p1.length) player1 = p1[0].name;
          if (p2.length) player2 = p2[0].name;

          formatted.push(
            `${m.event_name} - ${m.sport_name} Round ${m.round}: ${player1} vs ${player2} (${m.status})`
          );
        }

        return formatted;
      };

      (async () => {
        const final = await formatMatches(data);

        res.json({
          reply: final.length ? final : ["No data found"]
        });
      })();
    });

  } catch (error) {
    console.error(error);
    res.json({ reply: "AI error" });
  }
};

module.exports = { chatQuery };