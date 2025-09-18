import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("id");
    const period = searchParams.get("period") || "30d";
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    if (!teacherId) {
      return NextResponse.json({ error: "Missing teacher id" }, { status: 400 });
    }

    // Fetch teacher's buzzwords
    const { data: buzzwords, error: buzzError } = await supabase
      .from("buzzwords")
      .select("*")
      .eq("teacher_id", teacherId);

    if (buzzError) {
      return NextResponse.json({ error: buzzError.message }, { status: 500 });
    }

    const idToLabel: Record<string, string> = {};
    buzzwords?.forEach((b) => {
      idToLabel[b.id] = b.label;
    });

    // Get approved submissions
    const { data: submissions, error } = await supabase
      .from("submissions")
      .select(`*, session:sessions!inner(*)`)
      .eq("status", "approved")
      .gte("created_at", cutoffDate.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const teacherSubs = submissions?.filter((sub) => sub.session?.teacher_id === teacherId) || [];

    // Aggregate counts by label per day
    const dailyData: Record<string, Record<string, number>> = {};
    const labelTotals: Record<string, number> = {};

    teacherSubs.forEach((submission) => {
      const date = new Date(submission.created_at).toISOString().split("T")[0];
      const counts = submission.counts || {};
      if (!dailyData[date]) dailyData[date] = {};

      Object.entries(counts).forEach(([buzzwordId, count]) => {
        const label = idToLabel[buzzwordId];
        if (!label) return; // skip unknown buzzwords

        dailyData[date][label] = (dailyData[date][label] || 0) + (count as number);
        labelTotals[label] = (labelTotals[label] || 0) + (count as number);
      });
    });

    // Top 5 buzzwords by total count
    const topBuzzwords = Object.entries(labelTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([label]) => label);

    // Format chart data
    const chartData = Object.entries(dailyData).map(([date, counts]) => {
      const dataPoint: Record<string, any> = { date };
      topBuzzwords.forEach((label) => {
        dataPoint[label] = counts[label] || 0;
      });
      return dataPoint;
    });

    return NextResponse.json({
      chartData,
      topBuzzwords,
      totalSubmissions: teacherSubs.length,
      dateRange: {
        start: cutoffDate.toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error("Teacher analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
