import moment from "moment";

export const guid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const formatReport = (report: any) => {
  let data;

  if (report.payload) {
    let reportData = report.payload;
    data = {
      id: guid(),
      details: reportData.desc,
      device_id: reportData.uid,
      type: reportData.mode === "if" ? "illegal_fishing" : "emergency",
      name:
        reportData.mode === "if" ? "ILLEGAL FISHING REPORT" : "EMERGENCY ALERT",
      title:
        reportData.mode === "if"
          ? "ILLEGAL FISHING REPORT"
          : "EMERGENCY DISTRESS SIGNAL",
      address: reportData.addr.trim() !== "" ? reportData.addr : "N/A",
      reportee: reportData.name,
      source_platform: "node",
      date: Date.now(),
      date_formatted: moment().format("MMMM D YYYY"),
      coordinates: report.location,
      report_type: "AUTO",
    };
  } else {
    data = {
      id: guid(),
      details: report.details,
      device_id: report.device_id,
      type: "emergency",
      name: report.mode === "if" ? "ILLEGAL FISHING REPORT" : "EMERGENCY ALERT",
      title:
        report.mode === "if"
          ? "ILLEGAL FISHING REPORT"
          : "EMERGENCY DISTRESS SIGNAL",
      address: "N/A",
      reportee: "Anonymous",
      source_platform: "node",
      date: Date.now(),
      date_formatted: moment().format("MMMM D YYYY"),
      coordinates: report.coordinates,
      report_type: "MANUAL",
    };
  }

  return data;
};
