import { getPool, SLOT_TIMES } from "./_db.js";

// Public, aggregate-only, no names/emails/PII — real numbers for the
// site's "spots left" / "people booked" lines. Never invents a figure.
export default async (req, res) => {
  try {
    const { rows: [row] } = await getPool().query(
      `select
         (select count(*) from slot_events
           where status = 'booked'
             and slot_date between (now() at time zone 'Asia/Kolkata')::date
                               and (now() at time zone 'Asia/Kolkata')::date + 6) as booked_this_week,
         (select count(*) from slot_events
           where status in ('booked','blocked')
             and slot_date between (now() at time zone 'Asia/Kolkata')::date
                               and (now() at time zone 'Asia/Kolkata')::date + 6) as taken_this_week,
         (select count(*) from slot_events
           where status = 'booked'
             and slot_date >= (now() at time zone 'Asia/Kolkata')::date - 30) as booked_this_month`
    );
    const totalSlotsThisWeek = SLOT_TIMES.length * 7;
    const openThisWeek = Math.max(0, totalSlotsThisWeek - Number(row.taken_this_week));
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({
      openThisWeek,
      bookedThisMonth: Number(row.booked_this_month),
    });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};
