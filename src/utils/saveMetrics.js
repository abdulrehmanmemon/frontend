import { supabaseSegments } from "../helpers/supabaseClient";

const insertMetrics = async (metrics) => {
  try {
    const transformedMetrics = [];

    Object.keys(metrics).forEach((fileKey) => {
      const fileData = metrics[fileKey];
      const fileId = fileData.file_id;
      const year = fileData.Year;

      Object.keys(fileData).forEach((category) => {
        if (category !== "Year" && category !== "file_id") {
          Object.entries(fileData[category]).forEach(([metric, value]) => {
            transformedMetrics.push({
              file_id: fileId,
              category,
              name: metric,
              value: value !== null ? value.toString() : "N/A",
              data_type: typeof value,
              period:year
            });
          });
        }
      });
    });

    const { data, error } = await supabaseSegments.from("metrics").insert(transformedMetrics);

    if (error) {
      console.error("Error inserting metrics:", error);
      return { success: false, error };
    }
    
    console.log("Metrics inserted successfully!", data);

    // ✅ Call updateFileYear after metrics insertion
    const updateYearResult = await updateFileYear(metrics);
    if (!updateYearResult.success) {
      console.error("Error updating file year:", updateYearResult.error);
      return { success: false, error: updateYearResult.error };
    }

    return { success: true, data };

  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: err };
  }
};

const updateFileYear = async (metrics) => {
  try {
    for (const fileKey in metrics) {
      const fileData = metrics[fileKey];
      const fileId = fileData.file_id;
      const year = fileData.Year;

      const { data, error } = await supabaseSegments
        .from("file")
        .update({ year: year })
        .eq("id", fileId);

      if (error) {
        console.error(`Error updating year for file_id ${fileId}:`, error);
        return { success: false, error };
      } else {
        console.log(`Year updated successfully for file_id ${fileId}:`, data);
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: err };
  }
};

export default insertMetrics;
